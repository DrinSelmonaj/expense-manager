// db.js — lidhja me PostgreSQL
// Kredencialet lexohen nga .env (require në server.js e ngarkoi dotenv)
const { Pool, types } = require('pg');

// Kolonat DATE (OID 1082) kthehen si tekst 'YYYY-MM-DD', jo si objekt Date.
// PSE: pg i konverton në mesnatë lokale, JSON-i pastaj i dërgon në UTC —
// 24 qershor dilte "2026-06-23T22:00:00Z" dhe "Totali sot" s'gjente asgjë.
types.setTypeParser(1082, value => value);

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'expense_manager',
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Lidhja me DB deshtoi:', err.message);
  } else {
    console.log('✅ U lidh me PostgreSQL:', res.rows[0].now);
  }
});

module.exports = pool;