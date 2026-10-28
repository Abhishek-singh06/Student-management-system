import os
import sqlite3
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'students.db')


def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Departments Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS departments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL
            );
        ''')

        # 2. Students Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                registration_number TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE,
                department_id INTEGER,
                year_of_study INTEGER CHECK (year_of_study BETWEEN 1 AND 4),
                cgpa REAL,
                subjects TEXT,
                phone_number TEXT,
                FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
            );
        ''')

        # Schema Migration: Add cgpa and subjects if upgrading existing database
        cursor.execute("PRAGMA table_info(students);")
        columns = [col[1] for col in cursor.fetchall()]
        if 'cgpa' not in columns:
            cursor.execute("ALTER TABLE students ADD COLUMN cgpa REAL;")
        if 'subjects' not in columns:
            cursor.execute("ALTER TABLE students ADD COLUMN subjects TEXT;")

        # Populate sample departments if empty
        cursor.execute('SELECT COUNT(*) FROM departments;')
        if cursor.fetchone()[0] == 0:
            departments = [
                ('Computer Science & Engineering',),
                ('Electronics & Communication Engineering',),
                ('Mechanical Engineering',),
                ('Information Technology',)
            ]
            cursor.executemany('INSERT INTO departments (name) VALUES (?);', departments)

        # Populate sample student records if empty
        cursor.execute('SELECT COUNT(*) FROM students;')
        if cursor.fetchone()[0] == 0:
            sample_students = [
                ('2023CSE01', 'Srinivas Rao', 'srinivas.rao@college.edu', 1, 3, 8.85, 'DBMS, Operating Systems, Computer Networks', '9876543210'),
                ('2023CSE02', 'Priya Sharma', 'priya.sharma@college.edu', 1, 3, 9.20, 'DBMS, Algorithms, Software Engineering', '9876543211'),
                ('2023ECE01', 'Rahul Verma', 'rahul.verma@college.edu', 2, 2, 7.65, 'Digital Signal Processing, Microprocessors', '9876543212'),
                ('2024IT01', 'Ananya Iyer', 'ananya.iyer@college.edu', 4, 1, 9.40, 'Python Programming, Web Technologies', '9876543213'),
                ('2022ME01', 'Vikram Patel', 'vikram.patel@college.edu', 3, 4, 8.10, 'Thermodynamics, Fluid Mechanics, CAD', '9876543214'),
                ('2023CSE03', 'Sneha Reddy', 'sneha.reddy@college.edu', 1, 3, 8.95, 'DBMS, Machine Learning, Cloud Computing', '9876543215')
            ]
            cursor.executemany('''
                INSERT INTO students 
                (registration_number, full_name, email, department_id, year_of_study, cgpa, subjects, phone_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            ''', sample_students)
        else:
            # Backfill sample CGPA and subjects if missing
            cursor.execute("UPDATE students SET cgpa = 8.5 WHERE cgpa IS NULL;")
            cursor.execute("UPDATE students SET subjects = 'DBMS, Computer Networks, Operating Systems' WHERE subjects IS NULL;")

        conn.commit()


# HTML Route
@app.route('/')
def index():
    return render_template('index.html')


# API: System Stats
@app.route('/api/stats', methods=['GET'])
def get_stats():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM students;')
        total_students = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM departments;')
        total_departments = cursor.fetchone()[0]

        cursor.execute('SELECT AVG(cgpa) FROM students WHERE cgpa IS NOT NULL;')
        avg_cgpa_row = cursor.fetchone()[0]
        avg_cgpa = round(avg_cgpa_row, 2) if avg_cgpa_row else 8.50

        return jsonify({
            'total_students': total_students,
            'total_departments': total_departments,
            'avg_cgpa': avg_cgpa
        })


# API: Departments List
@app.route('/api/departments', methods=['GET'])
def get_departments():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT id, name FROM departments ORDER BY name ASC;')
        departments = [dict(row) for row in cursor.fetchall()]
        return jsonify(departments)


# API: Students List (Search & Filter)
@app.route('/api/students', methods=['GET'])
def get_students():
    search = request.args.get('search', '').strip()
    department_id = request.args.get('department_id', '').strip()
    limit = request.args.get('limit', type=int)

    query = '''
        SELECT 
            s.id, 
            s.registration_number, 
            s.full_name, 
            s.email, 
            s.department_id, 
            d.name AS department_name, 
            s.year_of_study, 
            s.cgpa,
            s.subjects,
            s.phone_number
        FROM students s
        LEFT JOIN departments d ON s.department_id = d.id
        WHERE 1=1
    '''
    params = []

    if department_id:
        query += ' AND s.department_id = ?'
        params.append(department_id)

    if search:
        search_pattern = f'%{search}%'
        query += ' AND (s.full_name LIKE ? OR s.registration_number LIKE ? OR s.email LIKE ? OR s.subjects LIKE ?)'
        params.extend([search_pattern, search_pattern, search_pattern, search_pattern])

    query += ' ORDER BY s.id DESC'

    if limit and limit > 0:
        query += ' LIMIT ?'
        params.append(limit)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        students = [dict(row) for row in cursor.fetchall()]
        return jsonify(students)


# API: Get Single Student
@app.route('/api/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                s.id, 
                s.registration_number, 
                s.full_name, 
                s.email, 
                s.department_id, 
                d.name AS department_name, 
                s.year_of_study, 
                s.cgpa,
                s.subjects,
                s.phone_number
            FROM students s
            LEFT JOIN departments d ON s.department_id = d.id
            WHERE s.id = ?;
        ''', (student_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({'error': 'Student not found.'}), 404
        return jsonify(dict(row))


# API: Create Student
@app.route('/api/students', methods=['POST'])
def create_student():
    data = request.get_json() or {}

    reg_num = (data.get('registration_number') or '').strip().upper()
    full_name = (data.get('full_name') or '').strip()
    email = (data.get('email') or '').strip() or None
    dept_id = data.get('department_id') or None
    year_of_study = data.get('year_of_study') or 1
    cgpa = data.get('cgpa')
    subjects = (data.get('subjects') or '').strip() or 'Core Academic Curriculum'
    phone_number = (data.get('phone_number') or '').strip() or None

    if not reg_num:
        return jsonify({'error': 'Registration number is required.'}), 400
    if not full_name:
        return jsonify({'error': 'Full name is required.'}), 400

    try:
        year_of_study = int(year_of_study)
        if year_of_study < 1 or year_of_study > 4:
            return jsonify({'error': 'Year of study must be between 1 and 4.'}), 400
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid year of study.'}), 400

    if cgpa is not None and cgpa != '':
        try:
            cgpa = float(cgpa)
            if cgpa < 0.0 or cgpa > 10.0:
                return jsonify({'error': 'CGPA must be between 0.0 and 10.0.'}), 400
        except (ValueError, TypeError):
            cgpa = None

    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO students 
                (registration_number, full_name, email, department_id, year_of_study, cgpa, subjects, phone_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            ''', (reg_num, full_name, email, dept_id, year_of_study, cgpa, subjects, phone_number))
            conn.commit()
            new_id = cursor.lastrowid

            return jsonify({
                'message': 'Student registered successfully.',
                'id': new_id
            }), 201

    except sqlite3.IntegrityError as e:
        err_msg = str(e).lower()
        if 'registration_number' in err_msg or 'unique' in err_msg:
            return jsonify({'error': f'Registration number "{reg_num}" already exists in the database.'}), 409
        elif 'email' in err_msg:
            return jsonify({'error': f'Email "{email}" is already registered.'}), 409
        elif 'foreign key' in err_msg:
            return jsonify({'error': 'Selected department is invalid.'}), 400
        else:
            return jsonify({'error': f'Database integrity error: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# API: Update Student
@app.route('/api/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.get_json() or {}

    reg_num = (data.get('registration_number') or '').strip().upper()
    full_name = (data.get('full_name') or '').strip()
    email = (data.get('email') or '').strip() or None
    dept_id = data.get('department_id') or None
    year_of_study = data.get('year_of_study') or 1
    cgpa = data.get('cgpa')
    subjects = (data.get('subjects') or '').strip() or 'Core Academic Curriculum'
    phone_number = (data.get('phone_number') or '').strip() or None

    if not reg_num:
        return jsonify({'error': 'Registration number is required.'}), 400
    if not full_name:
        return jsonify({'error': 'Full name is required.'}), 400

    try:
        year_of_study = int(year_of_study)
        if year_of_study < 1 or year_of_study > 4:
            return jsonify({'error': 'Year of study must be between 1 and 4.'}), 400
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid year of study.'}), 400

    if cgpa is not None and cgpa != '':
        try:
            cgpa = float(cgpa)
            if cgpa < 0.0 or cgpa > 10.0:
                return jsonify({'error': 'CGPA must be between 0.0 and 10.0.'}), 400
        except (ValueError, TypeError):
            cgpa = None

    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM students WHERE id = ?;', (student_id,))
            if not cursor.fetchone():
                return jsonify({'error': 'Student not found.'}), 404

            cursor.execute('''
                UPDATE students 
                SET registration_number = ?, 
                    full_name = ?, 
                    email = ?, 
                    department_id = ?, 
                    year_of_study = ?, 
                    cgpa = ?,
                    subjects = ?,
                    phone_number = ?
                WHERE id = ?;
            ''', (reg_num, full_name, email, dept_id, year_of_study, cgpa, subjects, phone_number, student_id))
            conn.commit()

            return jsonify({'message': 'Student record updated successfully.'})

    except sqlite3.IntegrityError as e:
        err_msg = str(e).lower()
        if 'registration_number' in err_msg or 'unique' in err_msg:
            return jsonify({'error': f'Registration number "{reg_num}" is already used by another student.'}), 409
        elif 'email' in err_msg:
            return jsonify({'error': f'Email "{email}" is already used by another student.'}), 409
        else:
            return jsonify({'error': f'Database integrity error: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# API: Delete Student
@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, registration_number, full_name FROM students WHERE id = ?;', (student_id,))
            student = cursor.fetchone()
            if not student:
                return jsonify({'error': 'Student not found.'}), 404

            cursor.execute('DELETE FROM students WHERE id = ?;', (student_id,))
            conn.commit()

            return jsonify({
                'message': f'Student {student["full_name"]} ({student["registration_number"]}) was permanently deleted.'
            })
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# API: SQL Query Console (For DBMS Viva & Testing)
@app.route('/api/sql-query', methods=['POST'])
def execute_sql_query():
    import time
    data = request.get_json() or {}
    query = (data.get('query') or '').strip()

    if not query:
        return jsonify({'error': 'SQL query string cannot be empty.'}), 400

    start_time = time.time()
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query)

            if cursor.description:
                columns = [col[0] for col in cursor.description]
                rows = [list(row) for row in cursor.fetchall()]
                row_count = len(rows)
            else:
                conn.commit()
                columns = []
                rows = []
                row_count = cursor.rowcount

            execution_ms = round((time.time() - start_time) * 1000, 2)

            return jsonify({
                'success': True,
                'columns': columns,
                'rows': rows,
                'row_count': row_count,
                'execution_ms': execution_ms
            })
    except sqlite3.Error as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


# API: Database Schema & Metadata (For Viva & ERD)
@app.route('/api/schema', methods=['GET'])
def get_database_schema():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Departments metadata
            cursor.execute("PRAGMA table_info(departments);")
            dept_cols = [dict(row) for row in cursor.fetchall()]

            # Students metadata
            cursor.execute("PRAGMA table_info(students);")
            student_cols = [dict(row) for row in cursor.fetchall()]

            # Foreign keys on students
            cursor.execute("PRAGMA foreign_key_list(students);")
            student_fks = [dict(row) for row in cursor.fetchall()]

            return jsonify({
                'tables': {
                    'departments': {
                        'columns': dept_cols,
                        'primary_key': 'id',
                        'foreign_keys': []
                    },
                    'students': {
                        'columns': student_cols,
                        'primary_key': 'id',
                        'foreign_keys': student_fks
                    }
                }
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    init_db()
    print("=" * 60)
    print(" Student Management System (Python Flask + SQLite)")
    print(" Local Server running at: http://127.0.0.1:5000")
    print(" Database: students.db (Persistent SQLite with CGPA & Subjects)")
    print("=" * 60)
    app.run(host='127.0.0.1', port=5000, debug=False)
