const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// List maintenance requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, i.name as item_name, u.username as reported_by_name
      FROM maintenance_requests m
      JOIN inventory_items i ON m.item_id = i.id
      JOIN users u ON m.reported_by = u.id
      ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create maintenance request
router.post('/', authenticateToken, async (req, res) => {
  const { item_id, issue_description } = req.body;
  try {
    const issueResult = await pool.query(
      'INSERT INTO maintenance_requests (item_id, reported_by, issue_description) VALUES ($1, $2, $3) RETURNING *',
      [item_id, req.user.id, issue_description]
    );
    res.status(201).json(issueResult.rows[0]);
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    res.status(400).json({ error: 'Server error' });
  }
});

// Update maintenance status
router.put('/:id', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res) => {
  const { status } = req.body; // 'In Progress', 'Completed'
  try {
    let updateQuery = 'UPDATE maintenance_requests SET status = $1';
    let params = [status];
    
    if (status === 'Completed') {
      updateQuery += ', repair_date = CURRENT_TIMESTAMP';
    }
    updateQuery += ' WHERE id = $2 RETURNING *';
    params.push(req.params.id);

    const result = await pool.query(updateQuery, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Request not found' });
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
