// utils.js — ndihmës të përbashkët për të dyja faqet (ngarkohet i pari)

// ─── SIGURIA ──────────────────────────────────────────

// Kthen tekstin të sigurt për t'u futur në innerHTML.
// PSE: përshkrimi dhe emri i kategorisë vijnë nga përdoruesi — pa këtë,
// një përshkrim si <img src=x onerror=alert(1)> do të ekzekutohej si kod (XSS).
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── DATAT ────────────────────────────────────────────

// Data e sotme lokale si 'YYYY-MM-DD'.
// PSE jo toISOString(): ajo kthen datën në UTC — në Kosovë (UTC+1/+2) mes
// orës 00:00 dhe 02:00 do të jepte datën e djeshme.
function todayLocal() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

// Konverton vlerën nga API në Date lokal.
// 'YYYY-MM-DD' (kolonat DATE) lexohet si mesnatë LOKALE — new Date('2026-06-24')
// do ta lexonte si mesnatë UTC dhe në zona me UTC negative do të dilte dita e kaluar.
function parseApiDate(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value); // timestamp-et (week_start, month) kanë zonën brenda
}
