// main.js — inicializimi sipas faqes

// ─── Theme (punon në të dyja faqet) ────────────────────
const themeToggle = document.getElementById('theme-toggle');
const savedTheme  = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
});

// ─── CILA FAQE JEMI? ──────────────────────────────────
const isAnalysisPage = document.getElementById('trend-chart') !== null;

// ─── FAQJA E ANALIZËS ─────────────────────────────────
if (isAnalysisPage) {
  document.addEventListener('DOMContentLoaded', async () => {
    await initCharts(); // nga charts.js

    // default: muaji aktual
    const today        = todayLocal();
    const firstOfMonth = today.substring(0, 7) + '-01';
    document.getElementById('date-from').value = firstOfMonth;
    document.getElementById('date-to').value   = today;

    document.getElementById('btn-analyze').addEventListener('click', () => {
      const from = document.getElementById('date-from').value;
      const to   = document.getElementById('date-to').value;
      if (!from || !to)  { alert('Zgjidh të dyja datat'); return; }
      if (from > to)     { alert('"Nga" duhet të jetë para "Deri"'); return; }
      loadRangeCharts(from, to); // nga charts.js
    });
  });
}

// ─── FAQJA KRYESORE ───────────────────────────────────
if (!isAnalysisPage) {
  document.addEventListener('DOMContentLoaded', async () => {
    // vendos datën e sotme si default
    document.getElementById('date').value = todayLocal();

    await loadCategories();
    await loadExpenses();
    await loadAlertConfig();
  });

  // ── Shto Shpenzim ──
  document.getElementById('btn-add').addEventListener('click', async () => {
    const amount      = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const category_id = document.getElementById('category').value;
    const date        = document.getElementById('date').value;

    if (!amount || amount <= 0) { showMessage('Shuma duhet të jetë më e madhe se 0', 'error'); return; }
    if (!date)                  { showMessage('Zgjidh një datë', 'error'); return; }

    try {
      await addExpense({
        amount:       parseFloat(amount),
        description:  description || null,
        category_id:  category_id || null,
        expense_date: date
      });
      showMessage('Shpenzimi u shtua me sukses!');
      clearForm();
      document.getElementById('date').value = todayLocal();
      await loadExpenses();
    } catch (err) {
      showMessage('Gabim gjatë shtimit të shpenzimit', 'error');
    }
  });

  // ── Fshi Shpenzim ──
  async function handleDelete(id) {
    if (!confirm('A je i sigurt që dëshiron ta fshish këtë shpenzim?')) return;
    try {
      await deleteExpense(id);
      showMessage('Shpenzimi u fshi!');
      await loadExpenses();
    } catch (err) {
      showMessage('Gabim gjatë fshirjes', 'error');
    }
  }
  window.handleDelete = handleDelete; // e ekspozon globalisht për onclick në ui.js

  // ── Alert Config ──
  document.getElementById('btn-save-alert').addEventListener('click', async () => {
    const email         = document.getElementById('alert-email').value;
    const monthly_limit = document.getElementById('alert-limit').value;
    if (!email || !monthly_limit) { showMessage('Plotëso të gjitha fushat', 'error'); return; }
    try {
      await saveAlertConfig({ email, monthly_limit: parseFloat(monthly_limit) });
      showMessage('Konfigurimi u ruajt!');
    } catch (err) {
      showMessage('Gabim gjatë ruajtjes', 'error');
    }
  });
}

// ─── LOAD FUNCTIONS ───────────────────────────────────
async function loadCategories() {
  try {
    const categories = await getCategories();
    renderCategories(categories);
  } catch (err) {
    showMessage('Gabim gjatë ngarkimit të kategorive', 'error');
  }
}

async function loadExpenses() {
  try {
    const expenses = await getExpenses();
    renderExpenses(expenses);
    renderStats(expenses);
  } catch (err) {
    showMessage('Gabim gjatë ngarkimit të shpenzimeve', 'error');
  }
}

async function loadAlertConfig() {
  try {
    const config = await getAlertConfig();
    // FIX: vendosim .value (vlerën reale), jo vetëm .placeholder
    document.getElementById('alert-limit').value = config.monthly_limit || '';
    document.getElementById('alert-email').value = config.email         || '';
  } catch (err) {
    console.error('Gabim gjatë ngarkimit të konfigurimit:', err);
  }
}