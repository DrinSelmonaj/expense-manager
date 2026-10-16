// Teste integrimi — kërkojnë PostgreSQL dhe një databazë VEÇMAS për teste:
//   createdb expense_manager_test
//   psql -d expense_manager_test -f ../database/schema.sql
// PSE databazë veçmas: testet shtojnë/fshijnë shpenzime dhe prekin alert_log —
// s'duhet të ndryshojnë të dhënat e tua reale. Nëse DB s'ekziston, testet anashkalohen.

// Duhet vendosur PARA require('../server'): dotenv s'i mbishkruan variablat ekzistuese
process.env.DB_NAME = process.env.TEST_DB_NAME || 'expense_manager_test';

const test   = require('node:test');
const assert = require('node:assert/strict');
const app    = require('../server');
const pool   = require('../db');
const { claimMonthlyAlert } = require('../services/emailService');

let server;
let baseUrl;
let dbAvailable = true;

test.before(async () => {
  try {
    await pool.query('SELECT 1 FROM alert_log LIMIT 1');
  } catch {
    dbAvailable = false;
    return;
  }
  // alert joaktiv — asnjë test s'duhet të dërgojë email real
  await pool.query(`
    INSERT INTO alert_config (id, email, monthly_limit, is_active) VALUES (1, 'test@example.com', 500, false)
    ON CONFLICT (id) DO UPDATE SET is_active = false`);
  await new Promise(resolve => {
    server = app.listen(0, () => {           // porti 0 = çdo port i lirë
      baseUrl = `http://localhost:${server.address().port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await pool.end();
});

function skipWithoutDb(t) {
  if (!dbAvailable) t.skip('databaza expense_manager_test s\'ekziston');
  return !dbAvailable;
}

test('POST /expenses me shumë të pavlefshme kthen 400, jo 500', async t => {
  if (skipWithoutDb(t)) return;
  const res = await fetch(`${baseUrl}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 'abc' })
  });
  assert.equal(res.status, 400);
});

test('DELETE /expenses/abc kthen 400, DELETE i ID-së që s\'ekziston kthen 404', async t => {
  if (skipWithoutDb(t)) return;
  assert.equal((await fetch(`${baseUrl}/expenses/abc`, { method: 'DELETE' })).status, 400);
  assert.equal((await fetch(`${baseUrl}/expenses/999999`, { method: 'DELETE' })).status, 404);
});

test('GET /stats/range me datë të pavlefshme kthen 400', async t => {
  if (skipWithoutDb(t)) return;
  const res = await fetch(`${baseUrl}/stats/range?from=2026-01-01&to=nesër`);
  assert.equal(res.status, 400);
});

test('expense_date kthehet si "YYYY-MM-DD", pa zhvendosje UTC', async t => {
  if (skipWithoutDb(t)) return;
  const created = await fetch(`${baseUrl}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 1.25, description: 'test-date', expense_date: '2026-06-24' })
  }).then(r => r.json());

  try {
    assert.equal(created.expense_date, '2026-06-24');
    const list = await fetch(`${baseUrl}/expenses`).then(r => r.json());
    assert.equal(list.find(e => e.id === created.id).expense_date, '2026-06-24');
  } finally {
    await pool.query('DELETE FROM expenses WHERE id = $1', [created.id]);
  }
});

test('claimMonthlyAlert lejon vetëm një alert në muaj, përveç kur limiti ngrihet', async t => {
  if (skipWithoutDb(t)) return;
  await pool.query('DELETE FROM alert_log');
  try {
    assert.equal(await claimMonthlyAlert(500), true,  'alerti i parë i muajit');
    assert.equal(await claimMonthlyAlert(500), false, 'i dyti me të njëjtin limit');
    assert.equal(await claimMonthlyAlert(400), false, 'limit më i ulët');
    assert.equal(await claimMonthlyAlert(800), true,  'limiti u ngrit → alert i ri');
  } finally {
    await pool.query('DELETE FROM alert_log');
  }
});
