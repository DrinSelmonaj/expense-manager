const express             = require('express');
const router              = express.Router();
const pool                = require('../db');
// FIX: require i zhvendosur në krye, larg route definitions
const { checkAndSendAlert } = require('../services/emailService');
const { validateExpense, isPositiveInteger } = require('../validation');

// ─── GET /api/expenses ─────────────────────────────────
// Kthen të gjitha shpenzimet me emrin e kategorisë
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM v_expenses_full' // view që krijuam në schema.sql
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// ─── POST /api/expenses ────────────────────────────────
// Shton shpenzim të ri
// Body: { amount, description, category_id, expense_date }
router.post('/', async (req, res) => {
  try {
    const { error, value } = validateExpense(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    // COALESCE: nëse s'ka datë, DB vendos CURRENT_DATE (NULL eksplicit s'do
    // të aktivizonte DEFAULT-in e kolonës, por do të shkelte NOT NULL)
    const result = await pool.query(
      `INSERT INTO expenses (amount, description, category_id, expense_date)
       VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE))
       RETURNING *`,
      [value.amount, value.description, value.category_id, value.expense_date]
    );

    // kontrollo limitin menjëherë pas shtimit (dërgon max 1 email në muaj)
    checkAndSendAlert();

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // 23503 = foreign key violation — category_id s'ekziston
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Kategoria nuk ekziston' });
    }
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// ─── DELETE /api/expenses/:id ──────────────────────────
// Fshin shpenzim sipas ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params; // merr id nga URL: /api/expenses/5
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: 'ID e pavlefshme' });
    }

    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 RETURNING *',
      [id]
    );

    // nëse result.rows është bosh, ID nuk ekzistonte
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shpenzimi nuk u gjet' });
    }

    res.json({ message: 'Shpenzimi u fshi', deleted: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

module.exports = router;