// ui.js — manipulimi i DOM, asgjë nga logjika e biznesit

// ─── CATEGORIES ───────────────────────────────────────

// Mbush dropdown-in e kategorive
function renderCategories(categories) {
  const select = document.getElementById('category');

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    select.appendChild(option);
  });
}

// ─── EXPENSES ─────────────────────────────────────────

// Shfaq listën e shpenzimeve në DOM
function renderExpenses(expenses) {
  const list = document.getElementById('expenses-list');

  // nëse nuk ka shpenzime, shfaq mesazh
  if (expenses.length === 0) {
    list.innerHTML = '<p class="empty-msg">Nuk ka shpenzime ende.</p>';
    return;
  }

  // krijo HTML për çdo shpenzim — çdo tekst nga përdoruesi kalon nga escapeHtml()
  // (utils.js), përndryshe një përshkrim me <tag> do të interpretohej si HTML
  list.innerHTML = expenses.map(exp => `
    <div class="expense-item" data-id="${Number(exp.id)}">
      <div class="expense-left">
        <span class="expense-category" style="background:${escapeHtml(exp.category_color || '#6b7280')}">
          ${escapeHtml(exp.category_name || 'Pa kategori')}
        </span>
        <span class="expense-desc">${escapeHtml(exp.description || '-')}</span>
        <span class="expense-date">${formatDate(exp.expense_date)}</span>
      </div>
      <div class="expense-right">
        <span class="expense-amount">€${parseFloat(exp.amount).toFixed(2)}</span>
        <button class="btn-delete" onclick="handleDelete(${Number(exp.id)})">🗑</button>
      </div>
    </div>
  `).join('');
}

// ─── STATISTIKAT ──────────────────────────────────────

function renderStats(expenses) {
  const today     = todayLocal(); // format: 2026-06-24
  const thisMonth = today.substring(0, 7);                  // format: 2026-06

  const totalToday = expenses
    .filter(e => e.expense_date.startsWith(today))
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const totalMonth = expenses
    .filter(e => e.expense_date.startsWith(thisMonth))
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const totalAll = expenses
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  document.getElementById('total-today').textContent = `€${totalToday.toFixed(2)}`;
  document.getElementById('total-month').textContent = `€${totalMonth.toFixed(2)}`;
  document.getElementById('total-all').textContent   = `€${totalAll.toFixed(2)}`;
}

// ─── HELPERS ──────────────────────────────────────────

// Konverto datën nga ISO format në format shqip
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = parseApiDate(dateStr);
  return date.toLocaleDateString('sq-AL', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric'
  });
}

// Pastro formën pas shtimit
function clearForm() {
  document.getElementById('amount').value      = '';
  document.getElementById('description').value = '';
  document.getElementById('category').value    = '';
  document.getElementById('date').value        = '';
}

// Shfaq mesazh gabimi ose suksesi
function showMessage(text, type = 'success') {
  const existing = document.querySelector('.message');
  if (existing) existing.remove();

  const msg = document.createElement('div');
  msg.className = `message message-${type}`;
  msg.textContent = text;

  document.querySelector('.form-section').prepend(msg);

  // fshij mesazhin pas 3 sekondave
  setTimeout(() => msg.remove(), 3000);
}