const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all requests (Admin/Manager see all, Staff see own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      result = await query(`
        SELECT r.*, i.name as item_name, u.username as requester_name 
        FROM equipment_requests r
        JOIN inventory_items i ON r.item_id = i.id
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `);
    } else {
      result = await query(`
        SELECT r.*, i.name as item_name 
        FROM equipment_requests r
        JOIN inventory_items i ON r.item_id = i.id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC
      `, [req.user.id]);
    }
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new request (All authenticated users)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { item_id, quantity_requested } = req.body;
    
    // Check if item exists and has enough quantity
    const itemCheck = await query('SELECT quantity FROM inventory_items WHERE id = $1', [item_id]);
    if (itemCheck.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    
    const result = await query(
      'INSERT INTO equipment_requests (user_id, item_id, quantity_requested) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, item_id, quantity_requested]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update request status (Admin and Manager only)
router.put('/:id/status', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Begin transaction
    await query('BEGIN');
    
    const requestRes = await query('SELECT * FROM equipment_requests WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (requestRes.rows.length === 0) {
      await query('ROLLBACK');
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const request = requestRes.rows[0];
    if (request.status !== 'Pending') {
      await query('ROLLBACK');
      return res.status(400).json({ error: 'Request is already processed' });
    }

    if (status === 'Approved') {
      // Check inventory
      const itemRes = await query('SELECT quantity FROM inventory_items WHERE id = $1 FOR UPDATE', [request.item_id]);
      if (itemRes.rows[0].quantity < request.quantity_requested) {
        await query('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient inventory' });
      }
      
      // Deduct inventory
      await query('UPDATE inventory_items SET quantity = quantity - $1 WHERE id = $2', [request.quantity_requested, request.item_id]);
    }

    // Update request
    const updateRes = await query(
      'UPDATE equipment_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    
    await query('COMMIT');
    res.json(updateRes.rows[0]);
  } catch (error) {
    await query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
