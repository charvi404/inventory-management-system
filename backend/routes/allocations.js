const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// List allocations
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT a.*, i.name as item_name, u.username as user_name 
      FROM allocations a
      JOIN inventory_items i ON a.item_id = i.id
      JOIN users u ON a.user_id = u.id
      ORDER BY a.assigned_date DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create allocation / Assign to user
router.post('/', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res) => {
  const { item_id, target_user_id, department } = req.body;
  try {
    await pool.query('BEGIN');
    
    // Check item exists and has quantity
    const itemResult = await pool.query('SELECT quantity FROM inventory_items WHERE id = $1 FOR UPDATE', [item_id]);
    if (itemResult.rows.length === 0) throw new Error('Item not found');
    if (itemResult.rows[0].quantity < 1) throw new Error('Item out of stock');
    
    // Reduce quantity
    await pool.query('UPDATE inventory_items SET quantity = quantity - 1 WHERE id = $1', [item_id]);
    
    // Create allocation
    const insertResult = await pool.query(
      'INSERT INTO allocations (item_id, user_id, department) VALUES ($1, $2, $3) RETURNING *',
      [item_id, target_user_id, department]
    );
    
    await pool.query('COMMIT');
    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating allocation:', error);
    res.status(400).json({ error: error.message || 'Server error' });
  }
});

// Transfer asset (return or transfer) - simplied to return for now
router.put('/:id/transfer', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res) => {
  const { action } = req.body; // 'return'
  try {
    await pool.query('BEGIN');
    
    const allocationResult = await pool.query('SELECT * FROM allocations WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (allocationResult.rows.length === 0) throw new Error('Allocation not found');
    
    const allocation = allocationResult.rows[0];
    if (allocation.status === 'Returned') throw new Error('Already returned');
    
    if (action === 'return') {
      await pool.query(
        "UPDATE allocations SET status = 'Returned', return_date = CURRENT_TIMESTAMP WHERE id = $1", 
        [req.params.id]
      );
      // Increase qty back
      await pool.query('UPDATE inventory_items SET quantity = quantity + 1 WHERE id = $1', [allocation.item_id]);
    }
    
    await pool.query('COMMIT');
    res.json({ message: 'Allocation updated successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error transferring allocation:', error);
    res.status(400).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;
