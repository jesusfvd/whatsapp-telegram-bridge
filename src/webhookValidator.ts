/**
 * Webhook Validator module
 * Handles WhatsApp Cloud API webhook verification
 */

import { Request, Response } from 'express';

/**
 * Interface for webhook verification query parameters
 */
export interface VerificationRequest {
  'hub.mode': string;
  'hub.verify_token': string;
  'hub.challenge': string;
}

/**
 * Handles GET /webhook endpoint for Meta webhook verification
 * @param req - Express request object with query parameters
 * @param res - Express response object
 * @param verifyToken - The configured verification token
 */
export function handleWebhookVerification(
  req: Request<{}, {}, {}, VerificationRequest>,
  res: Response,
  verifyToken: string
): void {
  const hubMode = req.query['hub.mode'];
  const hubVerifyToken = req.query['hub.verify_token'];
  const hubChallenge = req.query['hub.challenge'];

  // Validate presence of required parameters
  if (!hubMode || !hubVerifyToken || !hubChallenge) {
    res.status(400).send('Missing required parameters');
    return;
  }

  // Validate hub.mode is "subscribe"
  if (hubMode !== 'subscribe') {
    res.status(400).send('Invalid hub.mode');
    return;
  }

  // Validate verify token matches configured token
  if (hubVerifyToken !== verifyToken) {
    res.status(403).send('Verification token mismatch');
    return;
  }

  // Verification successful - return challenge
  res.status(200).send(hubChallenge);
}
