# Menaxhues Shpenzimesh

Aplikacion web për gjurmimin e shpenzimeve personale.

## Stack
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js + Express
- **Databaza:** PostgreSQL

## Funksionalitetet
- Shto shpenzime me kategori, përshkrim dhe datë
- Fshi shpenzime
- Statistika: totali i sotëm, mujor dhe gjithsej
- 8 kategori të para-ndërtuara me ngjyra

## Struktura
expense-manager/

├── backend/
│   ├── routes/
│   │   ├── categories.js
│   │   └── expenses.js
│   ├── db.js
│   └── server.js
└── frontend/
├── css/style.css
├── js/
│   ├── api.js
│   ├── ui.js
│   └── main.js
└── index.html

## Instalimi
```bash
# 1. Klono repon
git clone https://github.com/d13ini/expense-manager.git

# 2. Instalo dependencies
cd expense-manager/backend
npm install

# 3. Krijo databazën
psql -U postgres -c "CREATE DATABASE expense_manager;"
psql -U postgres -d expense_manager -f database/schema.sql

# 4. Starto serverin
node server.js

# 5. Hap frontend/index.html me Live Server
```

## API Endpoints
| Method | URL | Funksioni |
|--------|-----|-----------|
| GET | /api/categories | Merr të gjitha kategoritë |
| POST | /api/categories | Krijo kategori të re |
| GET | /api/expenses | Merr të gjitha shpenzimet |
| POST | /api/expenses | Shto shpenzim të ri |
| DELETE | /api/expenses/:id | Fshi shpenzim |
