'use strict';

const prisma = require('../lib/prisma');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');

const createMerchant = async (req, res) => {
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new ValidationError('name is required and must be a non-empty string.');
  }

  const merchant = await prisma.merchant.create({
    data: { name: name.trim() }
  });

  // Keep compatibility with old API ("merchantId" -> "id") if needed, but the client expects `merchant` to have an `id` or `merchantId`.
  // The frontend was getting `merchantId`. We'll return both.
  res.status(201).json({ 
    success: true, 
    merchant: {
      ...merchant,
      merchantId: merchant.id 
    }
  });
};

const getMerchant = async (req, res) => {
  const { merchantId } = req.params;
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId }
  });

  if (!merchant) throw new NotFoundError(`Merchant '${merchantId}' not found.`);

  res.json({ success: true, merchant });
};

const listMerchants = async (req, res) => {
  const merchants = await prisma.merchant.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, count: merchants.length, merchants });
};

const getMerchantDashboard = async (req, res) => {
  const { merchantId } = req.params;
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 50
      }
    }
  });

  if (!merchant) throw new NotFoundError(`Merchant '${merchantId}' not found.`);

  // Calculate total revenue
  const totalRevenue = merchant.transactions
    .filter(tx => tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  res.json({ 
    success: true, 
    merchant: {
      id: merchant.id,
      name: merchant.name,
      createdAt: merchant.createdAt,
      totalRevenue,
      recentTransactions: merchant.transactions
    }
  });
};

module.exports = { createMerchant, getMerchant, listMerchants, getMerchantDashboard };
