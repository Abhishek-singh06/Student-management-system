import sqlite3
from app import app, init_db, DB_PATH

def run_tests():
    print("=" * 60)
    print("RUNNING AUTOMATED TEST SUITE FOR STUDENT MANAGEMENT SYSTEM")
    print("=" * 60)

    # 1. Database Init Test
    print("[TEST 1] Initializing Database...")
    init_db()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM departments')
    dept_count = cursor.fetchone()[0]
    cursor.execute('SELECT COUNT(*) FROM students')
    student_count = cursor.fetchone()[0]
    print(f"-> Departments in DB: {dept_count}, Students in DB: {student_count}")
    assert dept_count == 4, f"Expected 4 departments, found {dept_count}"
    assert student_count >= 6, f"Expected at least 6 sample students, found {student_count}"
    conn.close()

    client = app.test_client()

    # 2. HTML Dashboard Test
    print("\n[TEST 2] Testing GET / (HTML Dashboard)...")
    res = client.get('/')
    assert res.status_code == 200, f"GET / returned {res.status_code}"
    assert b"Student MS" in res.data, "Title missing in HTML"
    assert b"students.db" in res.data, "DB badge missing in HTML"
    print("-> Dashboard HTML loaded cleanly (HTTP 200 OK)")

    # 3. Stats Endpoint Test
    print("\n[TEST 3] Testing GET /api/stats...")
    res = client.get('/api/stats')
    assert res.status_code == 200
    data = res.get_json()
    print(f"-> Stats payload: {data}")
    assert data['total_students'] >= 6
    assert data['total_departments'] == 4
    print("-> /api/stats accurately reflects database numbers")

    # 4. Add Student Test
    print("\n[TEST 4] Testing POST /api/students (Add Student)...")
    new_student = {
        'registration_number': '2024TEST01',
        'full_name': 'Aarav Gupta',
        'email': 'aarav.gupta@college.edu',
        'department_id': 1,
        'year_of_study': 2,
        'phone_number': '9988776655'
    }
    res = client.post('/api/students', json=new_student)
    assert res.status_code == 201, f"Create failed: {res.get_json()}"
    created_id = res.get_json()['id']
    print(f"-> Student added via API. Returned new ID: {created_id}")

    # Verify directly in SQLite file
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT registration_number, full_name, year_of_study FROM students WHERE id = ?', (created_id,))
    row = c.fetchone()
    assert row == ('2024TEST01', 'Aarav Gupta', 2), f"Row mismatch: {row}"
    conn.close()
    print(f"-> Verified directly in SQLite table: {row}")

    # 5. Duplicate Registration Number Test
    print("\n[TEST 5] Testing Duplicate Registration Number Rejection...")
    res_dup = client.post('/api/students', json=new_student)
    assert res_dup.status_code == 409, f"Expected 409 conflict, got {res_dup.status_code}"
    err_text = res_dup.get_json().get('error', '')
    print(f"-> Duplicate blocked correctly with error: '{err_text}'")

    # 6. Edit Student Test
    print("\n[TEST 6] Testing PUT /api/students/<id> (Edit Student)...")
    update_payload = {
        'registration_number': '2024TEST01',
        'full_name': 'Aarav K. Gupta',
        'email': 'aarav.new@college.edu',
        'department_id': 2,
        'year_of_study': 3,
        'phone_number': '9988770000'
    }
    res_edit = client.put(f'/api/students/{created_id}', json=update_payload)
    assert res_edit.status_code == 200, f"Edit failed: {res_edit.get_json()}"

    # Verify updated values in SQLite directly
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT full_name, year_of_study, department_id, phone_number FROM students WHERE id = ?', (created_id,))
    updated_row = c.fetchone()
    assert updated_row == ('Aarav K. Gupta', 3, 2, '9988770000'), f"Update failed in SQLite: {updated_row}"
    conn.close()
    print(f"-> Verified persisted update in SQLite: {updated_row}")

    # 7. Search & Filter Test
    print("\n[TEST 7] Testing Search and Filter...")
    res_search = client.get('/api/students?search=Aarav')
    search_results = res_search.get_json()
    assert len(search_results) == 1, f"Expected 1 search result, got {len(search_results)}"

    res_search_reg = client.get('/api/students?search=2024TEST01')
    assert len(res_search_reg.get_json()) == 1, "Search by registration number failed"

    res_filter_dept = client.get('/api/students?department_id=2')
    dept_results = res_filter_dept.get_json()
    assert any(s['id'] == created_id for s in dept_results), "Filter by department failed"
    print("-> Search by name, search by reg number, and department filtering all pass!")

    # 8. Delete Student Test
    print("\n[TEST 8] Testing DELETE /api/students/<id> (Delete Student)...")
    res_del = client.delete(f'/api/students/{created_id}')
    assert res_del.status_code == 200, f"Delete failed: {res_del.get_json()}"

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM students WHERE id = ?', (created_id,))
    assert c.fetchone() is None, "Student record was not deleted from SQLite"
    conn.close()
    print("-> Student successfully and permanently deleted from SQLite table.")

    # 9. Persistence Across Restart Simulation
    print("\n[TEST 9] Verifying Persistence Across App Restart...")
    init_db() # Call init_db again as if server restarted
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT COUNT(*) FROM students;')
    count_after_restart = c.fetchone()[0]
    conn.close()
    print(f"-> Student count after simulated restart: {count_after_restart}")
    assert count_after_restart >= 6, "Data was wiped on restart!"
    print("-> Database verified persistent (data.db is NOT wiped on restart)")

    # 10. SQL Query Console Endpoint Test
    print("\n[TEST 10] Testing POST /api/sql-query (Interactive SQL Console)...")
    join_query = {
        'query': 'SELECT s.registration_number, s.full_name, d.name AS dept_name, s.cgpa FROM students s JOIN departments d ON s.department_id = d.id ORDER BY s.cgpa DESC;'
    }
    res_sql = client.post('/api/sql-query', json=join_query)
    assert res_sql.status_code == 200, f"SQL Query failed: {res_sql.get_json()}"
    sql_data = res_sql.get_json()
    assert sql_data['success'] is True
    assert 'dept_name' in sql_data['columns']
    assert len(sql_data['rows']) >= 6
    assert 'execution_ms' in sql_data
    print(f"-> SQL Console returned {sql_data['row_count']} rows in {sql_data['execution_ms']}ms with columns: {sql_data['columns']}")

    # 11. Schema Metadata Endpoint Test
    print("\n[TEST 11] Testing GET /api/schema (Database Schema & Metadata)...")
    res_schema = client.get('/api/schema')
    assert res_schema.status_code == 200
    schema_data = res_schema.get_json()
    assert 'departments' in schema_data['tables']
    assert 'students' in schema_data['tables']
    assert schema_data['tables']['students']['primary_key'] == 'id'
    assert len(schema_data['tables']['students']['foreign_keys']) > 0
    print("-> Schema metadata endpoint verified (Tables, PKs, FKs correctly reported)")

    print("\n" + "=" * 60)
    print(" ALL 11 VERIFICATION TESTS PASSED SUCCESSFULLY! ")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
