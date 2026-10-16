// Teste njësie — pa DB, xhirojnë kudo me `npm test`
const test   = require('node:test');
const assert = require('node:assert/strict');
const { isValidDate, isPositiveInteger, validateExpense } = require('../validation');

test('isValidDate pranon vetëm data reale në formatin YYYY-MM-DD', () => {
  assert.equal(isValidDate('2026-06-24'), true);
  assert.equal(isValidDate('2028-02-29'), true);  // vit i brishtë
  assert.equal(isValidDate('2026-02-30'), false); // s'ekziston
  assert.equal(isValidDate('24-06-2026'), false);
  assert.equal(isValidDate("2026-06-24' OR 1=1"), false);
  assert.equal(isValidDate(undefined), false);
});

test('isPositiveInteger refuzon zero, negative dhe tekst', () => {
  assert.equal(isPositiveInteger('5'), true);
  assert.equal(isPositiveInteger(12), true);
  assert.equal(isPositiveInteger('0'), false);
  assert.equal(isPositiveInteger('-3'), false);
  assert.equal(isPositiveInteger('abc'), false);
  assert.equal(isPositiveInteger('1.5'), false);
});

test('validateExpense refuzon shuma të pavlefshme', () => {
  for (const amount of [undefined, null, '', 0, -2, 'abc', Infinity, 100000000]) {
    assert.ok(validateExpense({ amount }).error, `duhej refuzuar: ${amount}`);
  }
});

test('validateExpense refuzon përshkrim të gjatë, kategori dhe datë të pavlefshme', () => {
  assert.ok(validateExpense({ amount: 5, description: 'x'.repeat(256) }).error);
  assert.ok(validateExpense({ amount: 5, category_id: 'ushqim' }).error);
  assert.ok(validateExpense({ amount: 5, expense_date: '2026-13-01' }).error);
});

test('validateExpense pastron vlerat e vlefshme për INSERT', () => {
  const { error, value } = validateExpense({ amount: '2.50', description: 'Kafe', category_id: '1', expense_date: '2026-06-24' });
  assert.equal(error, undefined);
  assert.deepEqual(value, { amount: 2.5, description: 'Kafe', category_id: 1, expense_date: '2026-06-24' });

  // fushat opsionale bosh → null (DB vendos CURRENT_DATE për datën)
  assert.deepEqual(validateExpense({ amount: 3 }).value,
    { amount: 3, description: null, category_id: null, expense_date: null });
});
