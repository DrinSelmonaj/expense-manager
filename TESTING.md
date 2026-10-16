# Testing Manual — Menaxhues Shpenzimesh

## Mjedisi i Testimit
- OS: macOS (M2)
- Browser: Chrome
- Backend: Node.js + Express (port 3000)
- Frontend: Live Server (port 5500)
- Databaza: PostgreSQL 18

---

## TEST 1 — Ngarkimi i kategorive
**Hapi:** Hap aplikacionin në browser  
**Pritshmëria:** Dropdown "Kategoria" ka 8 opsione  
**Rezultati:**  KALON

---

## TEST 2 — Shto shpenzim valid
**Hapi:** Shuma: 2.50, Përshkrimi: "Kafe", Kategoria: "Ushqim & Pije", Data: sot  
**Pritshmëria:** Shpenzimi shfaqet në listë, statistikat përditësohen  
**Rezultati:**  KALON

---

## TEST 3 — Shto shpenzim pa shumë
**Hapi:** Lë fushën "Shuma" bosh, kliko "Shto Shpenzim"  
**Pritshmëria:** Mesazh gabimi "Shuma duhet të jetë më e madhe se 0"  
**Rezultati:**  KALON

---

## TEST 4 — Shto shpenzim pa datë
**Hapi:** Fshi datën, kliko "Shto Shpenzim"  
**Pritshmëria:** Mesazh gabimi "Zgjidh një datë"  
**Rezultati:**  KALON

---

## TEST 5 — Fshi shpenzim
**Hapi:** Kliko 🗑 pranë një shpenzimi → konfirmo  
**Pritshmëria:** Shpenzimi zhduket nga lista, statistikat përditësohen  
**Rezultati:** KALON

---

## TEST 6 — Statistikat
**Hapi:** Shto dy shpenzime: €10.00 dhe €5.00 sot  
**Pritshmëria:** "Sot" = €15.00, "Këtë muaj" dhe "Gjithsej" përditësohen  
**Rezultati:**  KALON

---

## TEST 7 — API direkt (Thunder Client)
**Hapi:** DELETE /api/expenses/999 (ID që nuk ekziston)  
**Pritshmëria:** Status 404, mesazh "Shpenzimi nuk u gjet"  
**Rezultati:**  KALON

---

## Rezultati Final
| Teste | Kalojnë | Dështojnë |
|-------|---------|-----------|
| 7     | 7       | 0         |
---

## Teste automatike (`npm test`)

Përveç testeve manuale më sipër, backend-i ka 10 teste automatike me `node:test`:

```bash
# një herë: databazë VEÇMAS për teste (testet shtojnë/fshijnë të dhëna)
createdb expense_manager_test
psql -d expense_manager_test -f database/schema.sql

cd backend && npm test
```

| Skedari | Lloji | Çfarë vërteton |
|---|---|---|
| `test/validation.test.js` | njësie (pa DB) | datat, ID-të dhe shumat e pavlefshme refuzohen; vlerat e vlefshme pastrohen |
| `test/api.integration.test.js` | integrimi | input i keq → 400 (jo 500); `expense_date` pa zhvendosje UTC; alerti mujor dërgohet vetëm një herë |

Testet e integrimit e çaktivizojnë alertin në DB-në e testit, kështu që s'dërgohet asnjë email. Nëse `expense_manager_test` s'ekziston, ato anashkalohen.
