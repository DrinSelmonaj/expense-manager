-- schema.sql — Menaxhues Shpenzimesh (PostgreSQL)
-- Përdorimi: psql -U postgres -d expense_manager -f database/schema.sql

-- ─── TABELAT ──────────────────────────────────────────

CREATE TABLE categories (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE,
    -- CHECK: vetëm ngjyrë hex — mbron edhe atributin style="" në frontend
    color      CHAR(7)     NOT NULL DEFAULT '#6c757d' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    icon       VARCHAR(40) NOT NULL DEFAULT 'tag',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE expenses (
    id           SERIAL PRIMARY KEY,
    amount       NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    description  VARCHAR(255),
    -- ON DELETE SET NULL: fshirja e kategorisë s'i fshin shpenzimet, i lë "Pa kategori"
    category_id  INT REFERENCES categories(id) ON DELETE SET NULL,
    expense_date DATE        NOT NULL DEFAULT CURRENT_DATE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Një rresht i vetëm (id = 1) — konfigurimi i alertit mujor
CREATE TABLE alert_config (
    id            INT PRIMARY KEY DEFAULT 1,
    email         VARCHAR(100)  NOT NULL,
    monthly_limit NUMERIC(10,2) NOT NULL DEFAULT 500,
    is_active     BOOLEAN DEFAULT true,
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Një rresht për çdo muaj kur u dërgua alerti — që të mos dërgohet pas çdo shpenzimi
CREATE TABLE alert_log (
    month         DATE PRIMARY KEY,           -- dita e parë e muajit
    monthly_limit NUMERIC(10,2) NOT NULL,     -- limiti në kohën e dërgimit
    sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEKSET ─────────────────────────────────────────

CREATE INDEX idx_categories_name   ON categories (name);
CREATE INDEX idx_expenses_category ON expenses (category_id);
CREATE INDEX idx_expenses_date     ON expenses (expense_date DESC);

-- ─── VIEWS (përdoren nga /api/expenses dhe /api/stats) ─

CREATE VIEW v_expenses_full AS
SELECT e.id, e.amount, e.description, e.expense_date, e.created_at,
       c.id    AS category_id,
       c.name  AS category_name,
       c.color AS category_color,
       c.icon  AS category_icon
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id
ORDER BY e.expense_date DESC, e.created_at DESC;

CREATE VIEW v_daily_totals AS
SELECT expense_date, SUM(amount) AS total_amount, COUNT(*) AS expense_count
FROM expenses
WHERE expense_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY expense_date
ORDER BY expense_date;

CREATE VIEW v_weekly_totals AS
SELECT DATE_TRUNC('week', expense_date::timestamptz) AS week_start,
       SUM(amount) AS total_amount, COUNT(*) AS expense_count
FROM expenses
WHERE expense_date >= CURRENT_DATE - INTERVAL '84 days'
GROUP BY DATE_TRUNC('week', expense_date::timestamptz)
ORDER BY DATE_TRUNC('week', expense_date::timestamptz);

CREATE VIEW v_monthly_totals AS
SELECT DATE_TRUNC('month', expense_date::timestamptz) AS month,
       SUM(amount) AS total_amount, COUNT(*) AS expense_count
FROM expenses
GROUP BY DATE_TRUNC('month', expense_date::timestamptz)
ORDER BY DATE_TRUNC('month', expense_date::timestamptz) DESC;

CREATE VIEW v_totals_by_category AS
SELECT c.id, c.name, c.color, c.icon,
       COUNT(e.id)   AS expense_count,
       SUM(e.amount) AS total_amount,
       AVG(e.amount) AS avg_amount
FROM categories c
LEFT JOIN expenses e ON e.category_id = c.id
GROUP BY c.id, c.name, c.color, c.icon
ORDER BY SUM(e.amount) DESC NULLS LAST;

-- ─── TË DHËNAT FILLESTARE ─────────────────────────────

INSERT INTO categories (name, color, icon) VALUES
    ('Ushqim & Pije', '#22c55e', 'shopping-cart'),
    ('Transport',     '#3b82f6', 'car'),
    ('Fatura & Qira', '#f59e0b', 'home'),
    ('Shëndetësi',    '#ef4444', 'heart'),
    ('Argëtim',       '#8b5cf6', 'music'),
    ('Veshje',        '#ec4899', 'shirt'),
    ('Edukim',        '#06b6d4', 'book'),
    ('Të tjera',      '#6b7280', 'tag');
