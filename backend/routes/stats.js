const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { isValidDate } = require('../validation');

// ─── GET /api/stats/daily ──────────────────────────────
// Shpenzimet ditore — 30 ditët e fundit (për bar chart)
router.get('/daily', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_daily_totals');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// ─── GET /api/stats/weekly ─────────────────────────────
// Shpenzimet javore — 12 javët e fundit (për line chart)
router.get('/weekly', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_weekly_totals');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// ─── GET /api/stats/monthly ────────────────────────────
// Shpenzimet mujore (për line chart alternativ)
router.get('/monthly', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_monthly_totals');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// ─── GET /api/stats/by-category ───────────────────────
// Shpenzimet sipas kategorisë (për donut chart)
router.get('/by-category', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_totals_by_category');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// GET /api/stats/range?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/range', async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Kërkohen parametrat "from" dhe "to"' });
  }
  if (!isValidDate(from) || !isValidDate(to)) {
    return res.status(400).json({ error: 'Datat duhet të jenë në formatin YYYY-MM-DD' });
  }

  try {
    const daily = await pool.query(
      `SELECT DATE(expense_date) AS expense_date,
              SUM(amount)        AS total_amount,
              COUNT(*)           AS count
       FROM expenses
       WHERE DATE(expense_date) BETWEEN $1 AND $2
       GROUP BY DATE(expense_date)
       ORDER BY expense_date ASC`,
      [from, to]
    );

    const byCategory = await pool.query(
      `SELECT c.name        AS name,
              c.color       AS color,
              SUM(e.amount) AS total_amount
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE DATE(e.expense_date) BETWEEN $1 AND $2
       GROUP BY c.name, c.color
       ORDER BY total_amount DESC`,
      [from, to]
    );

    res.json({
      daily:      daily.rows,
      byCategory: byCategory.rows
    });

  } catch (err) {
    console.error('Range stats error:', err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

module.exports = router;