/**
 * BFS – Bank Fraud Shield
 * Customer Care & Security Desk Controller
 * Connects Customer Dashboard directly with Admin SOC Support Center
 */

import { Request, Response } from 'express';
import { executeQuery, memoryStore } from '../config/db.ts';
import { formatBankingDateTime } from './transactionController.ts';

export interface SupportTicketRecord {
  ticket_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  subject: string;
  category: 'Security Alert' | 'Transaction Hold' | 'Account Access' | 'General Inquiry';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  created_at: string;
  updated_at: string;
  assigned_admin: string | null;
  last_message?: string;
  messages_count?: number;
}

export interface TicketMessageRecord {
  message_id: number;
  ticket_id: number;
  sender_id: number;
  sender_role: 'Customer' | 'Admin';
  sender_name: string;
  message_text: string;
  created_at: string;
}

/**
 * Get all support tickets
 * Customer sees their own; Admin sees all
 */
export async function getTickets(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const isAdmin = req.user.roleId === 2;
    const tickets: any[] = isAdmin
      ? await executeQuery('SELECT * FROM support_tickets ORDER BY updated_at DESC')
      : await executeQuery('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY updated_at DESC', [req.user.userId]);

    const enriched = tickets.map(t => {
      const user = memoryStore.users.find(u => u.user_id === t.user_id);
      const messages = memoryStore.ticket_messages.filter(m => m.ticket_id === t.ticket_id);
      const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;

      return {
        ...t,
        user_name: user?.name || 'Customer',
        user_email: user?.email || '',
        formattedCreatedAt: formatBankingDateTime(t.created_at).full,
        formattedUpdatedAt: formatBankingDateTime(t.updated_at).full,
        messages_count: messages.length,
        last_message: lastMsg?.message_text || ''
      };
    });

    res.status(200).json({ success: true, tickets: enriched });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}

/**
 * Get single ticket and conversation messages
 */
export async function getTicketDetail(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const ticketId = Number(id);

    const tickets: any[] = await executeQuery('SELECT * FROM support_tickets WHERE ticket_id = ?', [ticketId]);
    if (tickets.length === 0) {
      res.status(404).json({ success: false, message: 'Support ticket not found' });
      return;
    }

    const ticket = tickets[0];
    const isAdmin = req.user.roleId === 2;

    if (!isAdmin && ticket.user_id !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Access denied to this ticket' });
      return;
    }

    const user = memoryStore.users.find(u => u.user_id === ticket.user_id);
    const messages: any[] = await executeQuery(
      'SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC',
      [ticketId]
    );

    const enrichedMessages = messages.map(m => ({
      ...m,
      formattedTime: formatBankingDateTime(m.created_at).full
    }));

    res.status(200).json({
      success: true,
      ticket: {
        ...ticket,
        user_name: user?.name,
        user_email: user?.email,
        formattedCreatedAt: formatBankingDateTime(ticket.created_at).full,
        formattedUpdatedAt: formatBankingDateTime(ticket.updated_at).full
      },
      messages: enrichedMessages
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}

/**
 * Create new support ticket (Customer)
 */
export async function createTicket(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { subject, category, priority, message } = req.body;
    if (!subject || !message) {
      res.status(400).json({ success: false, message: 'Subject and message are required' });
      return;
    }

    const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const ticketRes = await executeQuery(
      'INSERT INTO support_tickets (user_id, subject, category, priority, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.userId,
        subject.trim(),
        category || 'General Inquiry',
        priority || 'Medium',
        'Open',
        nowIso,
        nowIso
      ]
    );

    const newTicketId = ticketRes.insertId;

    // Insert first message
    await executeQuery(
      'INSERT INTO ticket_messages (ticket_id, sender_id, sender_role, sender_name, message_text, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        newTicketId,
        req.user.userId,
        req.user.roleName,
        req.user.name,
        message.trim(),
        nowIso
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully. A BFS Bank Security Agent will review shortly.',
      ticketId: newTicketId
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}

/**
 * Reply to a ticket (Customer or Admin)
 */
export async function replyToTicket(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const ticketId = Number(id);
    const { message } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, message: 'Message text cannot be blank' });
      return;
    }

    const tickets = await executeQuery('SELECT * FROM support_tickets WHERE ticket_id = ?', [ticketId]);
    if (tickets.length === 0) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    const ticket = tickets[0];
    const isAdmin = req.user.roleId === 2;

    if (!isAdmin && ticket.user_id !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert message
    const msgRes = await executeQuery(
      'INSERT INTO ticket_messages (ticket_id, sender_id, sender_role, sender_name, message_text, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        ticketId,
        req.user.userId,
        req.user.roleName,
        req.user.name,
        message.trim(),
        nowIso
      ]
    );

    // Update ticket updated_at and status if admin replied
    let newStatus = ticket.status;
    let assignedAdmin = ticket.assigned_admin;
    if (isAdmin) {
      assignedAdmin = req.user.name;
      if (ticket.status === 'Open') {
        newStatus = 'In Progress';
      }
    } else if (ticket.status === 'Resolved') {
      newStatus = 'In Progress'; // Customer reopened
    }

    await executeQuery(
      'UPDATE support_tickets SET status = ?, assigned_admin = ?, updated_at = ? WHERE ticket_id = ?',
      [newStatus, assignedAdmin, nowIso, ticketId]
    );

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      messageId: msgRes.insertId,
      status: newStatus
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}

/**
 * Update ticket status (Admin)
 */
export async function updateTicketStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const ticketId = Number(id);
    const { status } = req.body;

    if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const reviewerName = req.user?.name || 'Security Officer';

    await executeQuery(
      'UPDATE support_tickets SET status = ?, assigned_admin = ?, updated_at = ? WHERE ticket_id = ?',
      [status, reviewerName, nowIso, ticketId]
    );

    res.status(200).json({
      success: true,
      message: `Ticket #${ticketId} status updated to ${status}`
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
}
