require('dotenv').config(); // i pari — db.js dhe emailService lexojnë process.env kur ngarkohen
const express    = require('express');
const cors       = require('cors');
const cron       = require('node-cron');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const categoryRoutes    = require('./routes/categories');
const expenseRoutes     = require('./routes/expenses');
const statsRoutes       = require('./routes/stats');
const alertConfigRoutes = require('./routes/alertConfig');

app.use('/api/categories',   categoryRoutes);
app.use('/api/expenses',     expenseRoutes);
app.use('/api/stats',        statsRoutes);
app.use('/api/alert-config', alertConfigRoutes);

app.get('/', (req, res) => {
  res.json({ message: '✅ Expense Manager API është aktiv' });
});

// Serveri dhe cron-et nisen vetëm kur skedari ekzekutohet direkt (npm start).
// Kur testet bëjnë require('./server'), marrin vetëm app-in — pa port të zënë
// dhe pa email-e të planifikuara.
if (require.main === module) {
  const { checkAndSendAlert, sendWeeklyReport, sendMonthlyReport } = require('./services/emailService');

  cron.schedule('0 20 * * *', () => checkAndSendAlert());
  cron.schedule('0 8 * * 1',  () => sendWeeklyReport());
  cron.schedule('0 8 1 * *',  () => sendMonthlyReport());

  app.listen(PORT, () => {
    console.log(`🚀 Serveri po dëgjon në http://localhost:${PORT}`);
  });
}

module.exports = app;
