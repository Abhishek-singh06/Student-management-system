# Simple Student Management System (DBMS Project)

A lightweight, reliable, standalone Student Management System built using **Python Flask**, **Vanilla JavaScript**, and **SQLite3** for college DBMS project reviews and viva presentations.

---

## 🛠️ Technology Stack
- **Frontend**: Clean Semantic HTML5, CSS3, Vanilla JavaScript (No React, Node.js, or external CDN dependencies — works 100% offline).
- **Backend**: Python Flask (`app.py`).
- **Database**: SQLite3 (`students.db`), using Python's built-in `sqlite3` module.
- **Client Cache**: Web `localStorage` mirroring for instant client-side performance and offline demo resilience.
- **Port**: `http://127.0.0.1:5000`

---

## ✨ Advanced Features Added for College Review
1. **Interactive SQL Query Console**: Run raw `SELECT`, `JOIN`, and `GROUP BY` queries directly inside the browser with live execution timing (in milliseconds) and formatted tabular results.
2. **Visual Database Schema & ERD Viewer**: Live interactive view of `departments` and `students` tables, Primary Keys (PK), Foreign Keys (FK), Check Constraints, and 1-to-N relationships.
3. **One-Click CSV Export**: Download complete student databases as clean CSV files (`student_academic_records_*.csv`).
4. **Printable Student Grade Card**: One-click printable academic grade card / transcript directly from the student view modal.
5. **Quick Filters & Multi-Column Sorting**:
   - Quick pills: *Top CGPA (&ge; 8.5)*, *1st Year*, *2nd Year*, *3rd Year*, *4th Year*.
   - Sorting: *Newest First*, *Name (A &rarr; Z)*, *CGPA (High to Low)*, *CGPA (Low to High)*, *Year of Study*.
6. **Dark / Light Mode**: Seamless theme switching with persistent user preference in `localStorage`.
7. **Toast Notifications**: Floating animated toast alerts for immediate user feedback.

---

## 🚀 How to Run the Application

### Method 1: One-Click Startup (Windows)
Double-click **`run.bat`** inside this folder. It will:
1. Detect Python.
2. Create a virtual environment (`venv`) and install Flask automatically.
3. Initialize the SQLite database `students.db` with sample records.
4. Launch the local web server and open your browser at **`http://127.0.0.1:5000`**.

### Method 2: Command Line (PowerShell / CMD)
```powershell
# 1. Open this folder
cd "simple-student-management"

# 2. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# 3. Install Flask
pip install -r requirements.txt

# 4. Start the server
python app.py
```
Open **`http://127.0.0.1:5000`** in any web browser.

To stop the server: Press `Ctrl + C` in the terminal.

---

## 🗄️ Database Schema & DBMS Concepts

The application automatically creates and manages **`students.db`** with two 3NF-normalized tables:

### 1. `departments` Table
```sql
CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);
```
- **Primary Key**: `id`
- **Unique Constraint**: `name` (Cannot have duplicate department names)

### 2. `students` Table
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

### 3. Key DBMS Viva Talking Points:
1. **Primary Key**: `id` uniquely identifies each student record.
2. **Candidate Key / Unique Constraint**: `registration_number` is unique across all students, preventing duplicate entries.
3. **Foreign Key & Referential Integrity**: `department_id` references `departments(id)`. Foreign keys are strictly enforced using `PRAGMA foreign_keys = ON;`. If a department is deleted, associated students have their department set to `NULL` (`ON DELETE SET NULL`) to prevent orphan deletion.
4. **Domain / Check Constraint**: `CHECK (year_of_study BETWEEN 1 AND 4)` and `CHECK (cgpa BETWEEN 0.0 AND 10.0)` validate domain integrity at the database engine level.
5. **SQL Injection Defense**: All database queries use parameterized placeholders (`?`), completely eliminating SQL injection risks.
6. **Data Persistence**: Data is saved to the SQLite file `students.db` and persists across restarts.

---

## 🔍 How to Inspect the Database During Demonstration
You can inspect the database in 3 ways:
1. **Directly in the Web UI**: Use the **SQL Console** and **Schema & ERD** tabs in the application navbar.
2. **Via Python CLI**:
   ```powershell
   python -c "import sqlite3; conn = sqlite3.connect('students.db'); print([dict(sqlite3.Row(cursor, r)) for r in conn.execute('SELECT * FROM students').fetchall()])"
   ```
3. **Via SQLite GUI**: Open `students.db` in [DB Browser for SQLite](https://sqlitebrowser.org/) or the VS Code SQLite extension to view tables, primary keys, and data visually.
