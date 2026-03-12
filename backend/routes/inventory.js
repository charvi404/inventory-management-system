const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all items (All authenticated users can view)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM inventory_items ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single item
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM inventory_items WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create item (Admin and Manager only)
router.post('/', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res) => {
  try {
    const { name, description, quantity, category, price } = req.body;
    const result = await query(
      'INSERT INTO inventory_items (name, description, quantity, category, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description || '', quantity || 0, category, price || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update item (Admin and Manager only)
router.put('/:id', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res) => {
  try {
    const { name, description, quantity, category, price } = req.body;
    const result = await query(
      `UPDATE inventory_items 
       SET name = $1, description = $2, quantity = $3, category = $4, price = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 RETURNING *`,
      [name, description, quantity, category, price, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete item (Admin only)
router.delete('/:id', authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const result = await query('DELETE FROM inventory_items WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    // Check for foreign key violation
    if (error.code === '23503') return res.status(400).json({ error: 'Cannot delete item with existing requests' });
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
