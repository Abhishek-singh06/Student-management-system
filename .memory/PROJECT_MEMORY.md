# Antigravity Project Memory & Session State

> **Last Updated:** 2026-10-24  
> **Source of Truth:** Codebase at `C:\Users\Abhishek Singh\Desktop\DBMS PROJECT\`  
> **Target Production App:** `simple-student-management\`  
> **Quick Resume Command:** Say `"read memory"` or `"resume project"` to instantly reload full project context.

---

## 1. Executive Summary & Context

- **Goal:** Provide a bulletproof, 100% working, standalone **Student Management System** for an academic **college DBMS project review and viva examination**.
- **Historical Challenge:** The original workspace contained a Spring Boot (`backend/`) and React (`frontend/`) architecture. However, Java / JDK was **not installed** on the Windows PC (`JAVA_HOME` missing), causing Spring Boot and Maven builds to fail completely.
- **Strategic Solution:** Created a self-contained, lightweight, zero-external-dependency version in `simple-student-management/` using **Python 3.14 Flask + SQLite3 + Vanilla HTML/CSS/JS**.
- **Dual Storage Strategy:** Persistent relational **SQLite database** (`students.db`) for authentic DBMS demonstration + **LocalStorage mirroring** for offline UI safety ("it's just for show").
- **Current Operational Status:** Server is fully functional and running live at **`http://127.0.0.1:5000`**. All **11 automated verification tests** pass with 100% success.

---

## 2. Technical Architecture & Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Backend** | Python Flask (`Flask>=3.0.0`) | `app.py` serving REST endpoints and HTML dashboard |
| **Runtime** | Python 3.14.7 | Located at `C:\Python314\`, managed via local `venv\` |
| **Database** | SQLite3 (`students.db`) | Python standard library `sqlite3` module (Zero DB server install needed) |
| **Referential Integrity** | `PRAGMA foreign_keys = ON;` | Strict SQLite foreign key constraint enforcement |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Zero build step, zero Node.js/npm requirement, fast 60fps rendering |
| **Client Storage** | Browser `localStorage` | Backs authentication sessions and student offline cache |
| **One-Click Startup** | `run.bat` | Batch script initializing venv, installing Flask, and opening `http://127.0.0.1:5000` |

---

## 3. Project Directory Map

```
C:\Users\Abhishek Singh\Desktop\DBMS PROJECT\
├── MEMORY.md                          <-- (THIS FILE) Canonical memory for instant reload
├── .memory/PROJECT_MEMORY.md          <-- Mirrored memory file
├── simple-student-management/         <-- [ACTIVE] Working DBMS College Application
│   ├── app.py                         <-- Flask REST API & SQLite controller
│   ├── students.db                    <-- Persistent SQLite3 database (3NF Normalized)
│   ├── requirements.txt               <-- Flask>=3.0.0
│   ├── run.bat                        <-- One-click Windows startup script
│   ├── test_app.py                    <-- Automated 11-test verification test suite
│   ├── README.md                      <-- Complete viva defense guide & table schema
│   ├── templates/
│   │   └── index.html                 <-- Landing page, Dashboard, Students, SQL Console, Schema/ERD
│   └── static/
│       ├── style.css                  <-- Light & Dark theme tokens, ERD styles, print styles
│       └── script.js                  <-- Vanilla JS engine, SQL console, CSV export, LocalStorage
├── backend/                           <-- [ARCHIVED] Original Spring Boot Java backend
├── frontend/                          <-- [ARCHIVED] Original React/Vite frontend
├── database/                          <-- Original SQL schema reference files
├── start-backend.bat                  <-- Wrapper for original backend
└── start-frontend.bat                 <-- Wrapper for original frontend
```

---

## 4. Relational Database Schema (3NF Normalized)

The database file is persistent at `simple-student-management/students.db`.

### Table 1: `departments` (Parent Entity)
```sql
CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);
```
- **Primary Key:** `id`
- **Unique Constraint:** `name` (Prevents duplicate department names)
- **Sample Records:** Computer Science & Engineering, Electronics & Communication Engineering, Mechanical Engineering, Information Technology.

### Table 2: `students` (Child Entity)
```sql
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    department_id INTEGER,
    year_of_study INTEGER CHECK (year_of_study BETWEEN 1 AND 4),
    cgpa REAL CHECK (cgpa >= 0.0 AND cgpa <= 10.0),
    subjects TEXT,
    phone_number TEXT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);
```
- **Primary Key:** `id` (System-generated surrogate key)
- **Candidate / Natural Key:** `registration_number` (`UNIQUE`, `NOT NULL`)
- **Foreign Key:** `department_id` referencing `departments(id)` with `ON DELETE SET NULL`
- **Domain Constraints:**
  - `CHECK (year_of_study BETWEEN 1 AND 4)`
  - `CHECK (cgpa BETWEEN 0.0 AND 10.0)`
- **SQL Injection Defense:** All queries parameterized using `?` placeholders.

---

## 5. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Serves the main single-page application (`templates/index.html`) |
| `GET` | `/api/stats` | Returns total students, total departments, and average CGPA |
| `GET` | `/api/departments` | Returns list of all departments ordered alphabetically |
| `GET` | `/api/students` | Search and filter students (`?search=...&department_id=...&limit=...`) |
| `GET` | `/api/students/<id>` | Returns full details of a single student by primary key |
| `POST` | `/api/students` | Creates student with validation (409 Conflict on duplicate reg/email) |
| `PUT` | `/api/students/<id>` | Updates student details while validating uniqueness constraints |
| `DELETE` | `/api/students/<id>`| Permanently deletes student from database |
| `POST` | `/api/sql-query` | **Interactive SQL Console**: Executes raw SQL with ms timing & tabular output |
| `GET` | `/api/schema` | Returns PRAGMA metadata (tables, columns, PKs, FKs) for ERD viewer |

---

## 6. Features Implemented & Verified

### A. Academic & DBMS Essentials
1. **Dashboard Overview:** Displays Total Students, Average CGPA, Department count, and Recent Enrollments.
2. **Student Directory:** Searchable table with dynamic search across Name, Reg No, Email, and Enrolled Subjects.
3. **Filtering & Sorting:** Filter by Department or Year, plus multi-column sorting (Newest, Name, CGPA High-to-Low, Year).
4. **Quick Filter Pills:** Quick filters for *All*, *⭐ Top CGPA (≥ 8.5)*, *1st Year*, *2nd Year*, *3rd Year*, *4th Year*.
5. **CGPA & Subject Tracking:** Color-coded CGPA badges (Green ≥ 8.5, Blue 7.0–8.4, Orange < 7.0) and subject tags.
6. **Add / Edit / Delete Modals:** Full validation with confirmation dialog before record deletion.

### B. Special Features Added
7. **Landing Page:** Hero section with quick access buttons, feature showcase, and seamless navigation.
8. **Authentication (Sign In / Sign Up):** Works via `localStorage` with demo credentials (`admin` / `password123`) or new user registration.
9. **LocalStorage Mirroring ("For Show"):** Mirrored cache ensures that even if disconnected, the UI remains 100% interactive.
10. **Interactive SQL Query Console (Viva Superpower):** Live browser-based SQL console with **18 categorized academic preset queries** (Inner Join, Left Outer Join, Self Join, Aggregate Summary, GROUP BY & HAVING, Multi-Column Grouping, Scalar Subquery, Correlated Subquery, IN Subquery, EXISTS, Window DENSE_RANK, Window Merit ROW_NUMBER, Window LAG Gap Analysis, Common Table Expression WITH CTE, CASE Expressions, Pattern Matching with LIKE, COALESCE & SUBSTR, NOT EXISTS), backward compatibility aliases (`join`, `aggregate`, `subquery`, `filter`, `departments`), **Instant Run on click** (auto-executes immediately upon chip selection), query timing in milliseconds, and `Ctrl+Enter` shortcut.
11. **Relational Schema & ERD Architecture Section:** Complete academic redesign featuring:
    - 6-metric summary ribbon (Tables, Attributes, Primary Keys, Foreign Keys, Domain Checks, 3NF level).
    - Visual Entity-Relationship Diagram (Crow's Foot notation) with 1:N cardinality bridge and referential integrity policy (`ON DELETE SET NULL`, `PRAGMA foreign_keys = ON;`).
    - Formal 3NF Normalization Proof cards (1NF Atomicity, 2NF Functional Dependency, 3NF Transitive Dependency elimination).
    - Executable SQL DDL viewer with one-click clipboard copy.
    - Live SQLite PRAGMA metadata inspector querying `/api/schema` in real-time.
    - Expanded 6-card DBMS Viva Defense Cheatsheet for academic reviews.
12. **CSV Export:** One-click download of student records as a formatted CSV file.
13. **Printable Grade Card:** One-click printout of student academic grade cards.
14. **Dark / Light Theme:** Toggleable color themes persisted in `localStorage`.
15. **Toast Notifications:** Smooth animated notifications for actions and errors.

---

## 7. Architectural Decisions (ADR Log)

- **ADR-001 (Python Flask + SQLite instead of Spring Boot + MySQL):**
  - *Context:* Host PC lacked Java JDK (`JAVA_HOME` not defined), blocking Spring Boot compilation.
  - *Decision:* Switched to Python Flask + SQLite. Python 3.14 was already verified installed. SQLite requires zero configuration, stores data in a persistent local file, and is standard for college DBMS vivas.
- **ADR-002 (Preserve Original Project Intact):**
  - *Decision:* All new simplified code is contained inside `simple-student-management\`. The original `backend/` and `frontend/` folders were untouched.
- **ADR-003 (Dual Relational & LocalStorage Engine):**
  - *Decision:* When API requests succeed, data is written to SQLite and cached in `localStorage`. If the network or backend is unreachable, the UI gracefully continues from `localStorage` so presentations never fail.
- **ADR-004 (PRAGMA Foreign Keys Enforcement):**
  - *Decision:* Explicitly executed `PRAGMA foreign_keys = ON;` on every SQLite connection to guarantee strict referential integrity for viva demonstrations.

---

## 8. Verification & Test Suite

The automated test suite in `simple-student-management/test_app.py` runs 11 rigorous integration tests:
```powershell
cd "simple-student-management"
.\venv\Scripts\python.exe test_app.py
```
**Test Results:**
- `[TEST 1]` Database Initialization: 4 departments, sample students verified.
- `[TEST 2]` Dashboard HTML: Status 200 OK, brand elements rendered.
- `[TEST 3]` Stats API: Accurately computes count & average CGPA.
- `[TEST 4]` POST Student: Inserts record into SQLite table with verified ID.
- `[TEST 5]` Duplicate Reg No: Rejected with HTTP 409 Conflict.
- `[TEST 6]` PUT Student: Updates persisted into SQLite.
- `[TEST 7]` Search & Filter: Reg number, name, and department filter verified.
- `[TEST 8]` DELETE Student: Permanent record removal verified.
- `[TEST 9]` Data Persistence: Verified `students.db` persists across restarts.
- `[TEST 10]` SQL Query Console: Raw SQL query returned rows in 2.05 ms.
- `[TEST 11]` Schema Metadata: Verified tables, PKs, and FK lists via PRAGMA.

---

## 9. DBMS Viva Cheat Sheet & Examiner Q&A

1. **Why SQLite over MySQL / Oracle for this project?**
   - SQLite is a self-contained, serverless, zero-configuration, ACID-compliant transactional SQL database engine. The entire database is stored in a single cross-platform disk file (`students.db`), making it ideal for self-contained desktop applications.
2. **What Normal Form is the database in?**
   - **Third Normal Form (3NF)**:
     - 1NF: All column values are atomic; primary keys defined.
     - 2NF: No partial dependency; non-key attributes depend fully on the primary key.
     - 3NF: No transitive dependencies; department information is factored out into `departments` rather than repeating strings in `students`.
3. **How is Referential Integrity maintained?**
   - Via the Foreign Key `students.department_id REFERENCES departments(id)`. Because SQLite has foreign keys disabled by default for backward compatibility, our backend explicitly executes `PRAGMA foreign_keys = ON;` on every connection.
4. **How do you prevent SQL Injection?**
   - By using **parameterized queries** (`?` placeholders) in Python's `sqlite3` driver. Input parameters are transmitted separately from the SQL statement logic and never concatenated into raw SQL strings.

---

## 10. How to Resume This Session in Future

Whenever you reopen this workspace in Antigravity or any agent:
1. Type: **`read memory`** (or `"resume project"`).
2. The agent will read this file (`MEMORY.md`), immediately knowing:
   - The active project is in `simple-student-management\`.
   - Python 3.14 is used (`.\venv\Scripts\python.exe app.py`).
   - The server runs on `http://127.0.0.1:5000`.
   - `students.db` holds the SQLite records.
   - All 11 tests are passing.
   - The original Spring Boot/React code is preserved for reference.
