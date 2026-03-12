const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const totalItemsRes = await query('SELECT COUNT(*) FROM inventory_items');
    const lowStockRes = await query('SELECT COUNT(*) FROM inventory_items WHERE quantity < 10');
    const pendingRequestsRes = await query("SELECT COUNT(*) FROM equipment_requests WHERE status = 'Pending'");
    
    const categoryDistributionRes = await query('SELECT category, COUNT(*) as count FROM inventory_items GROUP BY category');
    
    const recentActivityRes = await query(`
      SELECT 'Request ' || status as type, created_at 
      FROM equipment_requests 
      ORDER BY created_at DESC LIMIT 5
    `);

    res.json({
      totalItems: parseInt(totalItemsRes.rows[0].count),
      lowStockItems: parseInt(lowStockRes.rows[0].count),
      pendingRequests: parseInt(pendingRequestsRes.rows[0].count),
      categoryDistribution: categoryDistributionRes.rows,
      recentActivity: recentActivityRes.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
