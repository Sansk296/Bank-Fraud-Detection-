/**
 * BFS – Bank Fraud Shield
 * Centralized Fraud Detection Engine
 * 
 * Pipeline:
 * Transaction -> Fraud Engine -> Rule Checks -> ML Risk Score -> Risk Decision -> Fraud Alert -> Status
 */

import { executeQuery, TransactionRecord, memoryStore } from '../config/db.ts';
import { mlFraudModel, MLPredictionResult } from './mlFraudModel.ts';

// City Distance Matrix in Kilometers
export const CITY_DISTANCES: Record<string, Record<string, number>> = {
  'Pune': { 'Pune': 0, 'Mumbai': 150, 'Delhi': 1440, 'Bengaluru': 840, 'Hyderabad': 560, 'Chennai': 1180 },
  'Mumbai': { 'Pune': 150, 'Mumbai': 0, 'Delhi': 1420, 'Bengaluru': 980, 'Hyderabad': 710, 'Chennai': 1330 },
  'Delhi': { 'Pune': 1440, 'Mumbai': 1420, 'Delhi': 0, 'Bengaluru': 2170, 'Hyderabad': 1580, 'Chennai': 2200 },
  'Bengaluru': { 'Pune': 840, 'Mumbai': 980, 'Delhi': 2170, 'Bengaluru': 0, 'Hyderabad': 570, 'Chennai': 350 },
  'Hyderabad': { 'Pune': 560, 'Mumbai': 710, 'Delhi': 1580, 'Bengaluru': 570, 'Hyderabad': 0, 'Chennai': 630 },
  'Chennai': { 'Pune': 1180, 'Mumbai': 1330, 'Delhi': 2200, 'Bengaluru': 350, 'Hyderabad': 630, 'Chennai': 0 }
};

export const HIGH_VALUE_THRESHOLD = 50000; // ₹50,000 Configurable review threshold
export const RAPID_TXN_WINDOW_MINUTES = 10; // 10 minutes rolling window
export const RAPID_TXN_THRESHOLD_COUNT = 3;  // 3 or more transactions

export interface FraudEvaluationRequest {
  accountId: number;
  userId: number;
  amount: number;
  currentLocation: string;
  transactionTime?: Date;
}

export interface FraudEvaluationResult {
  isSuspicious: boolean;
  status: 'Successful' | 'Under Review';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
  detectionMethod: 'Rule-Based' | 'Machine Learning' | 'Both' | 'None (Normal)';
  mlResult: MLPredictionResult;
  ruleTriggers: {
    highValue: boolean;
    rapidPattern: boolean;
    impossibleTravel: boolean;
  };
  travelDetails?: {
    previousLocation: string;
    currentLocation: string;
    distanceKm: number;
    timeDifferenceMinutes: number;
    calculatedSpeedKmH: number;
  };
}

export async function evaluateTransaction(request: FraudEvaluationRequest): Promise<FraudEvaluationResult> {
  const txTime = request.transactionTime || new Date();
  const reasons: string[] = [];
  
  // 1. Fetch recent transactions for this account
  const recentTxns: TransactionRecord[] = await executeQuery(
    'SELECT * FROM transactions WHERE account_id = ? ORDER BY transaction_date DESC',
    [request.accountId]
  );

  // 2. Rule Check 1: High-Value Transaction Review Trigger (>= ₹50,000)
  const isHighValue = request.amount >= HIGH_VALUE_THRESHOLD;
  if (isHighValue) {
    reasons.push(
      `High-value transaction requires review (Amount: ₹${request.amount.toLocaleString('en-IN')} exceeds threshold of ₹${HIGH_VALUE_THRESHOLD.toLocaleString('en-IN')})`
    );
  }

  // 3. Rule Check 2: Rapid Transaction Pattern
  // Count transactions within the last RAPID_TXN_WINDOW_MINUTES
  const windowMillis = RAPID_TXN_WINDOW_MINUTES * 60 * 1000;
  const nowMillis = txTime.getTime();
  
  const txnsInWindow = recentTxns.filter(t => {
    const tTime = new Date(t.transaction_date).getTime();
    return (nowMillis - tTime) <= windowMillis && (nowMillis - tTime) >= 0;
  });

  const recentCountWithCurrent = txnsInWindow.length + 1;
  const isRapidPattern = recentCountWithCurrent >= RAPID_TXN_THRESHOLD_COUNT;
  if (isRapidPattern) {
    reasons.push(
      `Unusual transaction frequency: ${recentCountWithCurrent} transactions detected within ${RAPID_TXN_WINDOW_MINUTES} minutes`
    );
  }

  // 4. Rule Check 3: Impossible Travel / Location Anomaly
  let isImpossibleTravel = false;
  let travelDetails: FraudEvaluationResult['travelDetails'] | undefined;
  let calculatedSpeedKmH = 0;

  if (recentTxns.length > 0) {
    const lastTxn = recentTxns[0];
    const prevLoc = lastTxn.location;
    const currLoc = request.currentLocation;

    if (prevLoc && currLoc && prevLoc !== currLoc) {
      const dist = CITY_DISTANCES[prevLoc]?.[currLoc] || 500;
      const lastTxnTime = new Date(lastTxn.transaction_date).getTime();
      const diffMinutes = Math.max(1, Math.round((nowMillis - lastTxnTime) / 60000));
      calculatedSpeedKmH = (dist / (diffMinutes / 60));

      // Commercial flight speeds max ~800 km/h. Any physical relocation requiring > 600 km/h in < 180 mins is flagged
      if (dist >= 150 && (diffMinutes <= 60 || calculatedSpeedKmH > 600)) {
        isImpossibleTravel = true;
        reasons.push(
          `Impossible Travel / Location Anomaly: Distance of ${dist} km between ${prevLoc} and ${currLoc} in ${diffMinutes} minutes (Calculated speed ~${Math.round(calculatedSpeedKmH)} km/h exceeds realistic travel physics)`
        );
        travelDetails = {
          previousLocation: prevLoc,
          currentLocation: currLoc,
          distanceKm: dist,
          timeDifferenceMinutes: diffMinutes,
          calculatedSpeedKmH: Math.round(calculatedSpeedKmH)
        };
      }
    }
  }

  // Calculate historical user average transaction amount
  let userAvgAmount = 5000;
  if (recentTxns.length > 0) {
    const sum = recentTxns.reduce((acc, t) => acc + Number(t.amount), 0);
    userAvgAmount = sum / recentTxns.length;
  }

  // Check off-hours (between 11 PM and 5 AM)
  const hour = txTime.getHours();
  const isOffHours = hour >= 23 || hour < 5;

  // 5. ML Risk Assessment (JavaScript Logistic Regression)
  const mlResult = mlFraudModel.predict({
    amount: request.amount,
    recentTxnCount: recentCountWithCurrent,
    calculatedSpeedKmH,
    userAverageAmount: userAvgAmount,
    isOffHours
  });

  // 6. Synthesis and Decision
  const ruleTriggered = isHighValue || isRapidPattern || isImpossibleTravel;
  const mlTriggered = mlResult.riskScore >= 60; // Elevated ML risk

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (isImpossibleTravel || (isRapidPattern && mlResult.riskScore >= 50) || mlResult.riskScore >= 75) {
    riskLevel = 'HIGH';
  } else if (isHighValue || isRapidPattern || mlResult.riskScore >= 35) {
    riskLevel = 'MEDIUM';
  }

  let detectionMethod: 'Rule-Based' | 'Machine Learning' | 'Both' | 'None (Normal)' = 'None (Normal)';
  if (ruleTriggered && mlTriggered) {
    detectionMethod = 'Both';
  } else if (ruleTriggered) {
    detectionMethod = 'Rule-Based';
  } else if (mlTriggered) {
    detectionMethod = 'Machine Learning';
    reasons.push(`Machine Learning risk score elevated (${mlResult.riskScore}%) based on behavioural deviation`);
  }

  const isSuspicious = ruleTriggered || mlTriggered;
  const status: 'Successful' | 'Under Review' = isSuspicious ? 'Under Review' : 'Successful';

  return {
    isSuspicious,
    status,
    riskLevel,
    reasons,
    detectionMethod,
    mlResult,
    ruleTriggers: {
      highValue: isHighValue,
      rapidPattern: isRapidPattern,
      impossibleTravel: isImpossibleTravel
    },
    travelDetails
  };
}
