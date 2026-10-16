-- 001_alert_log.sql — për databaza ekzistuese, të krijuara para kësaj tabele
-- (instalimet e reja e marrin nga schema.sql). E sigurt për t'u ekzekutuar dy herë.
-- psql -d expense_manager -f database/migrations/001_alert_log.sql

CREATE TABLE IF NOT EXISTS alert_log (
    month         DATE PRIMARY KEY,
    monthly_limit NUMERIC(10,2) NOT NULL,
    sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
