// charts.js — të gjitha grafikët me Chart.js

let trendChart = null; // ruajmë referencën për të mundur update-in
let donutChart = null;

// ─── BAR / LINE CHART ─────────────────────────────────
async function loadTrendChart(period = 'daily') {
  // merr të dhënat sipas periudhës
  const data = await fetch(`http://localhost:3000/api/stats/${period}`)
    .then(r => r.json());

  // përgatit labels dhe vlerat
  const labels = data.map(row => {
    const date = parseApiDate(row.expense_date || row.week_start || row.month);
    if (period === 'daily')   return date.toLocaleDateString('sq-AL', { day: '2-digit', month: '2-digit' });
    if (period === 'weekly')  return `Java ${date.toLocaleDateString('sq-AL', { day: '2-digit', month: '2-digit' })}`;
    if (period === 'monthly') return date.toLocaleDateString('sq-AL', { month: 'long', year: 'numeric' });
  });

  const values = data.map(row => parseFloat(row.total_amount) || 0);

  // nëse grafiku ekziston, shkatërroe para se të krijosh të ri
  if (trendChart) trendChart.destroy();

  const ctx = document.getElementById('trend-chart').getContext('2d');

  trendChart = new Chart(ctx, {
    type: period === 'weekly' ? 'line' : 'bar', // javore = line, tjerat = bar
    data: {
      labels,
      datasets: [{
        label: 'Shpenzime (€)',
        data: values,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        borderWidth: 2,
        borderRadius: 6,       // bar me skaje të rrumbullakëta
        pointBackgroundColor: '#6366f1',
        tension: 0.4           // line chart i lëmuar
      }]
    },
   options: {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 20 }    // hapësirë sipër
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => `€${ctx.parsed.y.toFixed(2)}`
      }
    }
  },
scales: {
  y: {
    beginAtZero: true,
    suggestedMax: Math.max(...values) * 1.2, // 20% hapësirë sipër maksimumit
    ticks: {
      callback: val => `€${val}`
    }
  },
  x: {
    grid: { display: false }
  }
}
}
  });
}

// ─── DONUT CHART ──────────────────────────────────────
async function loadDonutChart() {
  const data = await fetch('http://localhost:3000/api/stats/by-category')
    .then(r => r.json());

  const filtered = data.filter(cat => parseFloat(cat.total_amount) > 0);
  if (filtered.length === 0) return;

  const labels = filtered.map(cat => cat.name);
  const values = filtered.map(cat => parseFloat(cat.total_amount));
  const colors = filtered.map(cat => cat.color);

  // shkatërro chart-in ekzistues para se të krijosh të ri
  if (donutChart) donutChart.destroy();

  const ctx = document.getElementById('donut-chart').getContext('2d');

  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 12 } }
        },
        tooltip: {
          callbacks: {
            label: ctx => `€${ctx.parsed.toFixed(2)}`
          }
        }
      }
    }
  });
}

// ─── TOGGLE BUTTONS ───────────────────────────────────
function initChartToggles() {
  document.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      // hiq active nga të gjithë
      document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
      // shto active te butoni i klikuar
      btn.classList.add('active');
      // ngarko grafikun e ri
      loadTrendChart(btn.dataset.period);
    });
  });
}

// ─── INICIALIZIMI ─────────────────────────────────────
// initCharts() thirret nga main.js brenda DOMContentLoaded të tij —
// NUK kemi nevojë për DOMContentLoaded të veçantë këtu.
async function initCharts() {
  await loadTrendChart('daily');
  await loadDonutChart();
  initChartToggles();
}

// ─── RANGE CHART ──────────────────────────────────────
async function loadRangeCharts(from, to) {
  const data = await getStatsByRange(from, to);

  // ── Trend chart (bar) ──
  const labels = data.daily.map(row => {
    const date = parseApiDate(row.expense_date);
    return date.toLocaleDateString('sq-AL', { day: '2-digit', month: '2-digit' });
  });
  const values = data.daily.map(row => parseFloat(row.total_amount) || 0);

  if (trendChart) trendChart.destroy();
  const ctx1 = document.getElementById('trend-chart').getContext('2d');
  trendChart = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Shpenzime (€)',
        data: values,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `€${ctx.parsed.y.toFixed(2)}` } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: val => `€${val}` } },
        x: { grid: { display: false } }
      }
    }
  });

  // ── Donut chart ──
  const filtered = data.byCategory.filter(c => parseFloat(c.total_amount) > 0);
  if (donutChart) donutChart.destroy();
  if (filtered.length > 0) {
    const ctx2 = document.getElementById('donut-chart').getContext('2d');
    donutChart = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: filtered.map(c => c.name),
        datasets: [{
          data:            filtered.map(c => parseFloat(c.total_amount)),
          backgroundColor: filtered.map(c => c.color),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: ctx => `€${ctx.parsed.toFixed(2)}` } }
        }
      }
    });
  }
}