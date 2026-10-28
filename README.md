# 🎓 Student Management System (SMS) - DBMS Project

A comprehensive, production-ready Student Management System designed for college DBMS project reviews, viva examinations, and lab demonstrations.

---

## ⚡ Quick Start: Running the Active Project (Python + SQLite)

The repository includes a self-contained, zero-configuration Python Flask application in [`simple-student-management/`](file:///simple-student-management/) with an interactive in-browser SQL query console, live ERD viewer, and pre-seeded SQLite database.

### Option A: One-Click Startup (Windows)
1. Navigate to `simple-student-management/`
2. Double-click **`run.bat`**  
   *(Automatically sets up the virtual environment, installs dependencies, and opens `http://127.0.0.1:5000`)*

### Option B: Manual Command Line
```powershell
cd simple-student-management
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
App runs at: **`http://127.0.0.1:5000`**

### Automated Tests
Run the 11-test automated verification suite:
```powershell
cd simple-student-management
.\venv\Scripts\python.exe test_app.py
```

---

## 🌟 Key Features

1. **Dashboard & Analytics:** Real-time metrics for total students, affiliated departments, average CGPA, and recent enrollments.
2. **Full CRUD Operations:** Add, update, view, and delete student records with validation and conflict checks.
3. **Interactive SQL Query Console (Viva Superpower):** Live browser SQL console with 18 categorized academic preset queries (Joins, CTEs, Window Functions, Subqueries, Aggregations), instant execution, and sub-millisecond query timing.
4. **Relational Schema & ERD Architecture:** Interactive Crow's foot Entity-Relationship Diagram, 3NF Normalization proofs, and live SQLite PRAGMA metadata inspector.
5. **Quick Filters & Multi-Column Sorting:** Filter by department, study year, or top CGPA (&ge; 8.5); sort by name, GPA, or admission recency.
6. **CSV Export & Grade Card Printing:** Download complete student rosters in CSV format and generate printable academic grade cards.
7. **Dark / Light Theme:** Modern responsive UI with theme persistence in `localStorage`.

---

## 🗄️ Relational Database Schema (3NF Normalized)

### 1. `departments` (Parent Entity)
```sql
CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);
```

### 2. `students` (Child Entity)
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

### DBMS Concepts Demonstrated:
* **Entity & Referential Integrity:** Primary keys (`id`), natural keys (`registration_number`), and foreign key (`department_id` referencing `departments.id`).
* **Strict Foreign Keys:** Connections enforce `PRAGMA foreign_keys = ON;`.
* **Third Normal Form (3NF):** Elimination of transitive dependencies by normalizing department records into a dedicated entity.
* **SQL Injection Prevention:** Parameterized SQL queries with `?` placeholders.
* **ACID Transactions:** Consistent atomic commits on inserts, updates, and deletes.

---

## ☕ Enterprise Stack: Spring Boot + React (Optional)

An alternative enterprise architecture is also available in the repository:
* **Backend:** Spring Boot 3.3.4 (Java 17+), Spring Data JPA, Hibernate, H2/MySQL
* **Frontend:** React (Vite), Material UI (MUI), Axios

### Running Spring Boot:
```bash
cd backend
.\mvnw.cmd spring-boot:run
```
*(Runs at `http://localhost:8080`, H2 Console at `http://localhost:8080/h2-console`)*

### Running React:
```bash
cd frontend
npm install
npm run dev
```
*(Runs at `http://localhost:5173`)*

---

## 📄 License
This project is open-source and created for academic learning and DBMS examination demonstrations.
