/**
 * BFS – Bank Fraud Shield
 * Authentication Controller: Registration, Login, Failed Login Brute-force Protection
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { executeQuery, UserRecord, memoryStore } from '../config/db.ts';
import { generateToken } from '../middleware/authMiddleware.ts';
import { sendSMSNotification } from '../services/smsService.ts';

// Strong password regex check: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export function evaluatePasswordStrength(password: string): 'Weak' | 'Medium' | 'Strong' {
  if (!password || password.length < 6) return 'Weak';
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  if (score >= 5 && password.length >= 8) return 'Strong';
  if (score >= 3) return 'Medium';
  return 'Weak';
}

/**
 * Register New Account
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // 1. Validations
    if (!name || !email || !phone || !password || !confirmPassword) {
      res.status(400).json({ success: false, message: 'All registration fields are required.' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    // Phone validation
    const phoneClean = phone.replace(/[^0-9+]/g, '');
    if (phoneClean.length < 10) {
      res.status(400).json({ success: false, message: 'Please provide a valid phone number (minimum 10 digits).' });
      return;
    }

    // Password match
    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Password confirmation does not match password.' });
      return;
    }

    // Password strength check
    if (!STRONG_PASSWORD_REGEX.test(password)) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.'
      });
      return;
    }

    // Check duplicate email
    const existingUsers: UserRecord[] = await executeQuery(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (existingUsers.length > 0) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    // 2. Hash password with bcrypt (salt rounds 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert User (Role 1 = Customer)
    const result = await executeQuery(
      'INSERT INTO users (role_id, name, email, phone, password, status, failed_login_attempts) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [1, name.trim(), email.toLowerCase().trim(), phoneClean, hashedPassword, 'Active', 0]
    );

    const newUserId = result.insertId;

    // 4. Automatically create initial Savings Account with ₹50,000 welcome balance
    const randomAccSuffix = Math.floor(100000 + Math.random() * 900000);
    const newAccountNumber = `BFS-SAV-${randomAccSuffix}`;
    
    await executeQuery(
      'INSERT INTO accounts (user_id, account_number, account_type, balance, status) VALUES (?, ?, ?, ?, ?)',
      [newUserId, newAccountNumber, 'Savings', 50000.00, 'Active']
    );

    // Record initial login / creation event
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    await executeQuery(
      'INSERT INTO login_history (user_id, login_time, login_status, ip_address) VALUES (?, NOW(), ?, ?)',
      [newUserId, 'Success', ip]
    );

    const token = generateToken({
      userId: newUserId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      roleId: 1,
      roleName: 'Customer'
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully. Welcome to BFS Bank Fraud Shield!',
      token,
      user: {
        userId: newUserId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phoneClean,
        roleId: 1,
        roleName: 'Customer',
        accountNumber: newAccountNumber,
        balance: 50000.00
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[AUTH] Registration error:', msg);
    res.status(500).json({ success: false, message: 'Registration failed due to a server error.' });
  }
}

/**
 * Login with Failed-Attempt Protection and 5-Hour Lockout
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || '127.0.0.1';

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query user
    const users: UserRecord[] = await executeQuery('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (users.length === 0) {
      // User does not exist - record generic failed attempt for security audit
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
      return;
    }

    const user = users[0];

    // Check if account is currently locked
    if (user.status === 'Locked' && user.locked_until) {
      const lockExpiry = new Date(user.locked_until).getTime();
      const remainingMs = lockExpiry - Date.now();

      if (remainingMs > 0) {
        const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const remainingMinutes = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

        // Record locked login attempt in Login History
        await executeQuery(
          'INSERT INTO login_history (user_id, login_time, login_status, ip_address) VALUES (?, NOW(), ?, ?)',
          [user.user_id, 'Account Locked', ip]
        );

        res.status(403).json({
          success: false,
          isLocked: true,
          lockedUntil: user.locked_until,
          remainingTime: `${remainingHours}h ${remainingMinutes}m`,
          message: `Your account is temporarily LOCKED due to repeated failed login attempts. Security lockout remaining: ${remainingHours} hours and ${remainingMinutes} minutes. Please contact Bank Security Admin to unlock earlier.`
        });
        return;
      } else {
        // Lock has naturally expired after 5 hours
        await executeQuery(
          'UPDATE users SET status = \'Active\', failed_login_attempts = 0, locked_until = NULL WHERE user_id = ?',
          [user.user_id]
        );
        user.status = 'Active';
        user.failed_login_attempts = 0;
        user.locked_until = null;
      }
    }

    // Verify Password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const newAttempts = user.failed_login_attempts + 1;

      // Record failed attempt in Login History
      await executeQuery(
        'INSERT INTO login_history (user_id, login_time, login_status, ip_address) VALUES (?, NOW(), ?, ?)',
        [user.user_id, 'Failed', ip]
      );

      if (newAttempts >= 3) {
        // Lock for 5 HOURS
        const lockDurationMs = 5 * 60 * 60 * 1000;
        const lockUntilDate = new Date(Date.now() + lockDurationMs);
        const lockUntilStr = lockUntilDate.toISOString().slice(0, 19).replace('T', ' ');

        await executeQuery(
          'UPDATE users SET failed_login_attempts = ?, locked_until = ?, status = ? WHERE user_id = ?',
          [3, lockUntilStr, 'Locked', user.user_id]
        );

        // Record Account Locked in Login History
        await executeQuery(
          'INSERT INTO login_history (user_id, login_time, login_status, ip_address) VALUES (?, NOW(), ?, ?)',
          [user.user_id, 'Account Locked', ip]
        );

        // Generate High-Risk Security Alert for Admin
        await executeQuery(
          'INSERT INTO fraud_alerts (transaction_id, user_id, risk_level, reason, current_location, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [
            null,
            user.user_id,
            'HIGH',
            `Brute-force attack detected: 3 consecutive failed login attempts on user "${user.name}" (${user.email}). Account automatically locked for 5 hours.`,
            ip,
            'Under Review'
          ]
        );

        // Dispatch SMS notification (Twilio or fallback audit log)
        await sendSMSNotification({
          toPhone: user.phone,
          userName: user.name,
          event: 'BRUTE_FORCE_LOCK',
          details: `Security Lockout Triggered: 3 incorrect password attempts from IP ${ip}. Account locked for 5 hours.`
        });

        res.status(403).json({
          success: false,
          isLocked: true,
          lockedUntil: lockUntilStr,
          remainingTime: '5h 0m',
          message: 'Security Alert: You have entered an incorrect password 3 times. For your security, this account has been LOCKED for 5 hours. An alert has been dispatched to the BFS Security Team.'
        });
        return;
      } else {
        // Attempt 1 or 2: Record and display progressive warning
        await executeQuery(
          'UPDATE users SET failed_login_attempts = ? WHERE user_id = ?',
          [newAttempts, user.user_id]
        );

        const remainingAttempts = 3 - newAttempts;
        let warningText = '';
        if (newAttempts === 1) {
          warningText = 'Incorrect password. Attempt 1 of 3. Please check your credentials carefully.';
        } else if (newAttempts === 2) {
          warningText = 'WARNING: Attempt 2 of 3 failed. 1 more incorrect attempt will lock your account for 5 hours!';
        }

        res.status(401).json({
          success: false,
          failedAttempts: newAttempts,
          remainingAttempts,
          message: warningText
        });
        return;
      }
    }

    // Password is VALID!
    // Reset failed login attempts on successful login
    if (user.failed_login_attempts > 0 || user.locked_until) {
      await executeQuery(
        'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, status = \'Active\' WHERE user_id = ?',
        [user.user_id]
      );
    }

    // Record Success in Login History
    await executeQuery(
      'INSERT INTO login_history (user_id, login_time, login_status, ip_address) VALUES (?, NOW(), ?, ?)',
      [user.user_id, 'Success', ip]
    );

    const roleName = user.role_id === 2 ? 'Admin' : 'Customer';
    const token = generateToken({
      userId: user.user_id,
      email: user.email,
      name: user.name,
      roleId: user.role_id,
      roleName
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roleId: user.role_id,
        roleName,
        status: user.status
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[AUTH] Login error:', msg);
    res.status(500).json({ success: false, message: 'Authentication service encountered an unexpected error.' });
  }
}

/**
 * Logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
}

/**
 * Get Authenticated User Profile
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const users: UserRecord[] = await executeQuery('SELECT * FROM users WHERE user_id = ?', [req.user.userId]);
    if (users.length === 0) {
      res.status(404).json({ success: false, message: 'User profile not found.' });
      return;
    }

    const user = users[0];
    const { password, ...safeUser } = user;
    
    // Also fetch user accounts
    const accounts = await executeQuery('SELECT * FROM accounts WHERE user_id = ?', [user.user_id]);

    res.status(200).json({
      success: true,
      user: {
        ...safeUser,
        roleName: user.role_id === 2 ? 'Admin' : 'Customer'
      },
      accounts
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}
