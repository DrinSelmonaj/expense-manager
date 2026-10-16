// validation.js — kontrolle të pastra (pa DB), të përdorura nga routes dhe nga testet
//
// PSE: pa këto, input-e si amount="abc" ose id="x" arrinin te PostgreSQL dhe
// ktheheshin si 500 "Gabim në server" — tani klienti merr 400 me mesazh të qartë.

const MAX_AMOUNT      = 99999999.99; // NUMERIC(10,2) në skemë
const MAX_DESCRIPTION = 255;         // VARCHAR(255) në skemë

// 'YYYY-MM-DD' dhe data duhet të ekzistojë realisht (jo 2026-02-30)
function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isPositiveInteger(value) {
  return /^[1-9]\d*$/.test(String(value));
}

// Kthen { error } ose { value } me të dhënat e pastruara për INSERT
function validateExpense({ amount, description, category_id, expense_date } = {}) {
  const parsedAmount = Number(amount);
  if (amount === null || amount === '' || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return { error: 'Shuma duhet të jetë më e madhe se 0' };
  }
  if (parsedAmount > MAX_AMOUNT) {
    return { error: 'Shuma është shumë e madhe' };
  }
  if (description != null && String(description).length > MAX_DESCRIPTION) {
    return { error: `Përshkrimi s'mund të kalojë ${MAX_DESCRIPTION} karaktere` };
  }
  if (category_id != null && category_id !== '' && !isPositiveInteger(category_id)) {
    return { error: 'Kategoria e pavlefshme' };
  }
  if (expense_date != null && expense_date !== '' && !isValidDate(expense_date)) {
    return { error: 'Data duhet të jetë në formatin YYYY-MM-DD' };
  }

  return {
    value: {
      amount:       parsedAmount,
      description:  description ? String(description) : null,
      category_id:  category_id ? Number(category_id) : null,
      expense_date: expense_date || null // null → DEFAULT CURRENT_DATE në DB
    }
  };
}

module.exports = { isValidDate, isPositiveInteger, validateExpense };
