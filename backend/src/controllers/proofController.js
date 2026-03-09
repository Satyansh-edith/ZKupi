/**
 * Proof Controller
 * ================
 * Handles ZK Proof verification endpoints.
 * Provides APIs for verifying single proofs, batch proofs, and retrieving
 * the public verification key (which frontend/clients need to generate proofs).
 */

const fs = require('fs');
const { verifyZKProof, loadVerificationKey } = require('../utils/proofVerifier');
const { ValidationError } = require('../utils/errorHandler');

/**
 * 1. Verify Single ZK Proof
 * POST /api/verify/proof
 *
 * @param {Request} req  - { proof: object, publicSignals: array }
 * @param {Response} res - { valid: boolean, message: string }
 */
const verifySingleProof = async (req, res) => {
  const { proof, publicSignals } = req.body;

  if (!proof || !publicSignals) {
    throw new ValidationError('Both proof and publicSignals are required.');
  }

  // Ensure public signals are in an array format
  const signalsArray = Array.isArray(publicSignals)
    ? publicSignals
    : [publicSignals.amount, publicSignals.nullifier, publicSignals.commitment];

  const isValid = await verifyZKProof(proof, signalsArray);

  res.json({
    success: true,
    valid: isValid,
    message: isValid
      ? 'ZK Proof mathematically verified successfully.'
      : 'Invalid ZK Proof. Validation failed.',
  });
};

/**
 * 2. Verify Batch of ZK Proofs
 * POST /api/verify/batch
 *
 * Useful for nodes or merchants auditing multiple incoming payments at once.
 * 
 * @param {Request} req  - { proofs: [{ proof, publicSignals }] }
 * @param {Response} res - { results: [{ index, valid, message }] }
 */
const verifyBatchProofs = async (req, res) => {
  const { proofs } = req.body;

  if (!Array.isArray(proofs) || proofs.length === 0) {
    throw new ValidationError('A non-empty array of proofs is required.');
  }

  // Cap batch size to prevent CPU exhaustion (SNARK verification is heavy)
  if (proofs.length > 50) {
    throw new ValidationError('Max batch size is 50 proofs per request.');
  }

  // Run verifications in parallel
  const results = await Promise.all(
    proofs.map(async (p, index) => {
      try {
        if (!p.proof || !p.publicSignals) {
          return { index, valid: false, error: 'Missing proof or publicSignals' };
        }

        const signalsArray = Array.isArray(p.publicSignals)
          ? p.publicSignals
          : [p.publicSignals.amount, p.publicSignals.nullifier, p.publicSignals.commitment];

        const isValid = await verifyZKProof(p.proof, signalsArray);

        return {
          index,
          valid: isValid,
          message: isValid ? 'Valid' : 'Invalid',
        };
      } catch (err) {
        return { index, valid: false, error: err.message };
      }
    })
  );

  const totalValid = results.filter((r) => r.valid).length;

  res.json({
    success: true,
    summary: `${totalValid} / ${proofs.length} proofs valid.`,
    results,
  });
};

/**
 * 3. Get Verification Key Data
 * GET /api/verify/key
 *
 * Exposes the public parameters of the verification key.
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
const getVerificationKey = async (req, res) => {
  try {
    const vkey = await loadVerificationKey();

    // Do not return the entire raw key indiscriminately as it can be large
    // Return the safe protocol info and curve info
    res.json({
      success: true,
      data: {
        protocol: vkey.protocol || 'groth16',
        curve: vkey.curve || 'bn128',
        vk_alpha_1: vkey.vk_alpha_1,
        vk_beta_2: vkey.vk_beta_2,
        vk_gamma_2: vkey.vk_gamma_2,
        vk_delta_2: vkey.vk_delta_2,
        // (vk_alfa_1 is the SnarkJS internal naming)
        nPublic: vkey.IC ? vkey.IC.length - 1 : 0, 
      },
    });
  } catch (err) {
    // If the key isn't loaded (e.g., mock mode), indicate that safely
    res.json({
      success: true,
      data: {
        mode: 'Mock Simulation',
        message: 'No real verification key loaded. Server is running in mock ZK mode.',
      },
    });
  }
};

module.exports = {
  verifySingleProof,
  verifyBatchProofs,
  getVerificationKey,
};
