/**
 * BFS – Bank Fraud Shield
 * JavaScript Logistic Regression Model for Fraud Risk Scoring
 * 
 * Implements a calibrated multivariate logistic regression model:
 * P(Fraud | X) = 1 / (1 + exp(-(w0 + sum(wi * xi))))
 * 
 * Features:
 * 1. x1: Normalized Amount Ratio (relative to standard ₹50,000 review threshold)
 * 2. x2: Rapid Transaction Velocity (count of transactions within rolling window)
 * 3. x3: Travel Velocity Anomaly (calculated km/h between locations)
 * 4. x4: Historical Amount Ratio (amount / user average transaction amount)
 * 5. x5: Off-hours Transaction Indicator (1 if between 11 PM and 5 AM, else 0)
 */

export interface FraudFeatures {
  amount: number;
  recentTxnCount: number; // in last 15 minutes
  calculatedSpeedKmH: number; // between current and previous location
  userAverageAmount: number;
  isOffHours: boolean;
}

export interface MLPredictionResult {
  riskScore: number; // 0 - 100%
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  modelType: 'Logistic Regression';
  featuresUsed: {
    normalizedAmount: number;
    transactionVelocity: number;
    travelSpeedKmH: number;
    amountDeviationRatio: number;
    offHoursFlag: number;
  };
  featureContributions: {
    feature: string;
    weight: number;
    value: number;
    impact: string;
  }[];
  explanation: string;
}

export class LogisticRegressionFraudModel {
  // Calibrated weights for banking fraud detection
  private weights = {
    bias: -2.8,               // Base log-odds (corresponds to ~5.7% base risk)
    w_amount: 1.65,          // Weight for high amount ratio
    w_velocity: 1.85,        // Weight for rapid transaction bursts
    w_travel_speed: 2.10,    // Weight for impossible physical travel velocity
    w_historical_dev: 1.25,  // Weight for sudden surge over average spending
    w_off_hours: 0.55        // Weight for late-night transactions
  };

  /**
   * Sigmoid activation function
   */
  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
  }

  /**
   * Predict fraud risk probability and score
   */
  public predict(features: FraudFeatures): MLPredictionResult {
    // 1. Normalize Amount: ₹50,000 threshold = 1.0, ₹100,000 = 2.0, capped at 4.0
    const normalizedAmount = Math.min(4.0, Math.max(0.0, features.amount / 50000));

    // 2. Normalize Velocity: 1 txn = 0.0, 3 txns = 1.0, 5+ = 2.0
    const transactionVelocity = Math.min(3.0, Math.max(0.0, (features.recentTxnCount - 1) / 2));

    // 3. Normalize Travel Speed: 0-100 km/h = 0, 800+ km/h = 2.0 (commercial flights max ~800 km/h, teleportation >> 1000 km/h)
    const travelSpeedKmH = Math.min(3.0, Math.max(0.0, features.calculatedSpeedKmH / 500));

    // 4. Amount deviation over history
    const avg = features.userAverageAmount > 0 ? features.userAverageAmount : 5000;
    const amountDeviationRatio = Math.min(3.0, Math.max(0.0, (features.amount / avg) - 1));

    // 5. Off hours (11 PM - 5 AM)
    const offHoursFlag = features.isOffHours ? 1.0 : 0.0;

    // Linear combination (Logit)
    const z = 
      this.weights.bias +
      this.weights.w_amount * normalizedAmount +
      this.weights.w_velocity * transactionVelocity +
      this.weights.w_travel_speed * travelSpeedKmH +
      this.weights.w_historical_dev * amountDeviationRatio +
      this.weights.w_off_hours * offHoursFlag;

    const probability = this.sigmoid(z);
    const riskScore = Math.round(probability * 100);

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    if (riskScore >= 70) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 35) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    const featureContributions = [
      {
        feature: 'Transaction Amount vs Threshold',
        weight: this.weights.w_amount,
        value: Number(normalizedAmount.toFixed(2)),
        impact: normalizedAmount > 1.0 ? 'High Positive Impact' : 'Normal'
      },
      {
        feature: 'Transaction Velocity (Last 15m)',
        weight: this.weights.w_velocity,
        value: features.recentTxnCount,
        impact: features.recentTxnCount >= 3 ? 'High Risk Burst' : 'Normal'
      },
      {
        feature: 'Physical Travel Speed (km/h)',
        weight: this.weights.w_travel_speed,
        value: Math.round(features.calculatedSpeedKmH),
        impact: features.calculatedSpeedKmH > 600 ? 'Impossible Travel Anomaly' : 'Realistic'
      },
      {
        feature: 'Historical Spending Surge',
        weight: this.weights.w_historical_dev,
        value: Number((features.amount / avg).toFixed(2)),
        impact: features.amount / avg > 3.0 ? 'Elevated Deviation' : 'Within Expected Profile'
      },
      {
        feature: 'Time-of-day Pattern',
        weight: this.weights.w_off_hours,
        value: offHoursFlag,
        impact: features.isOffHours ? 'Night-time Transaction' : 'Regular Banking Hours'
      }
    ];

    let explanation = `ML Logistic Regression assessed this transaction with a ${riskScore}% risk score (${riskLevel} Risk). `;
    if (travelSpeedKmH > 1.2) {
      explanation += `Primary driver is extreme location travel velocity (${Math.round(features.calculatedSpeedKmH)} km/h). `;
    }
    if (normalizedAmount >= 1.0) {
      explanation += `Transaction value (₹${features.amount.toLocaleString('en-IN')}) exceeds standard review thresholds. `;
    }
    if (transactionVelocity > 0.8) {
      explanation += `Rapid succession burst of ${features.recentTxnCount} transactions detected. `;
    }

    return {
      riskScore,
      riskLevel,
      modelType: 'Logistic Regression',
      featuresUsed: {
        normalizedAmount,
        transactionVelocity,
        travelSpeedKmH,
        amountDeviationRatio,
        offHoursFlag
      },
      featureContributions,
      explanation
    };
  }
}

export const mlFraudModel = new LogisticRegressionFraudModel();
