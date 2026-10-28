-- SAMPLE DATA FOR COLLEGE MANAGEMENT SYSTEM
-- Seeding script executed by Spring Boot on startup

-- 1. Populate Departments
INSERT INTO departments (id, name, code, description, created_at) VALUES
(1, 'Computer Science & Engineering', 'CSE', 'Department of Computer Science and Engineering', CURRENT_TIMESTAMP),
(2, 'Electronics & Communication Engineering', 'ECE', 'Department of Electronics and Communication Engineering', CURRENT_TIMESTAMP),
(3, 'Mechanical Engineering', 'ME', 'Department of Mechanical Engineering', CURRENT_TIMESTAMP),
(4, 'Information Technology', 'IT', 'Department of Information Technology', CURRENT_TIMESTAMP);

-- 2. Populate Users (BCrypt hash for 'password123': '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W')
INSERT INTO users (id, username, password, email, role, status, created_at, updated_at) VALUES
(1, 'admin', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'admin@college.edu', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'jdoe_faculty', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'jdoe@college.edu', 'FACULTY', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'asmith_faculty', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'asmith@college.edu', 'FACULTY', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'srinivas_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'srinivas@student.edu', 'STUDENT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'priya_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'priya@student.edu', 'STUDENT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'rahul_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'rahul@student.edu', 'STUDENT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'ananya_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'ananya@student.edu', 'STUDENT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'vikram_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'vikram@student.edu', 'STUDENT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'sneha_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'sneha@student.edu', 'STUDENT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'arjun_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'arjun@student.edu', 'STUDENT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Populate Faculty Details (Mapped to Users 2 and 3)
INSERT INTO faculty (id, employee_id, first_name, last_name, designation, phone, address, joining_date, department_id) VALUES
(2, 'EMP001', 'John', 'Doe', 'Professor', '9876543210', '123 Faculty Quarters, Campus', '2020-08-15', 1), -- CSE
(3, 'EMP002', 'Alice', 'Smith', 'Assistant Professor', '9876543211', '456 Lane Street, City', '2022-01-10', 2); -- ECE

-- 4. Populate Students Details (Mapped to Users 4 through 10)
INSERT INTO students (id, roll_number, first_name, last_name, year_of_study, date_of_birth, gender, phone, address, admission_date, department_id) VALUES
(4, '2023CSE01', 'Srinivas', 'Rao', 3, '2004-05-12', 'MALE', '9123456780', 'Vijayawada, AP', '2023-07-20', 1),
(5, '2023CSE02', 'Priya', 'Sharma', 3, '2004-09-25', 'FEMALE', '9123456781', 'New Delhi', '2023-07-22', 1),
(6, '2023ECE01', 'Rahul', 'Verma', 2, '2004-02-18', 'MALE', '9123456782', 'Mumbai, MH', '2023-07-20', 2),
(7, '2024IT01', 'Ananya', 'Iyer', 1, '2005-11-14', 'FEMALE', '9123456783', 'Chennai, TN', '2024-08-01', 4),
(8, '2022ME01', 'Vikram', 'Patel', 4, '2003-08-20', 'MALE', '9123456784', 'Ahmedabad, GJ', '2022-07-15', 3),
(9, '2023CSE03', 'Sneha', 'Reddy', 3, '2004-04-10', 'FEMALE', '9123456785', 'Hyderabad, TS', '2023-07-25', 1),
(10, '2024ECE02', 'Arjun', 'Nair', 1, '2005-06-30', 'MALE', '9123456786', 'Kochi, KL', '2024-08-05', 2);

-- 5. Populate Courses
INSERT INTO courses (id, code, name, description, credits, department_id) VALUES
(1, 'CS301', 'Database Management Systems', 'Introduction to relational databases, SQL, normalization, and transactions.', 4, 1),
(2, 'CS302', 'Operating Systems', 'Processes, CPU scheduling, synchronization, and memory management.', 4, 1),
(3, 'EC301', 'Digital Signal Processing', 'Signals and systems, Fourier transforms, filter design.', 3, 2),
(4, 'HS101', 'Technical Communication', 'Report writing, presentation skills, and professional ethics.', 2, NULL);

-- 6. Associate Faculty to Courses
INSERT INTO course_faculty (course_id, faculty_id, semester, academic_year) VALUES
(1, 2, 5, '2026-2027'),
(2, 2, 5, '2026-2027'),
(3, 3, 5, '2026-2027'),
(4, 3, 1, '2026-2027');

-- 7. Enroll Students in Courses
INSERT INTO course_enrollments (id, student_id, course_id, enrollment_date, status) VALUES
(1, 4, 1, '2026-07-20', 'ACTIVE'),
(2, 4, 2, '2026-07-20', 'ACTIVE'),
(3, 4, 4, '2026-07-20', 'ACTIVE'),
(4, 5, 1, '2026-07-20', 'ACTIVE'),
(5, 5, 2, '2026-07-20', 'ACTIVE'),
(6, 5, 4, '2026-07-20', 'ACTIVE'),
(7, 6, 3, '2026-07-20', 'ACTIVE'),
(8, 6, 4, '2026-07-20', 'ACTIVE');

-- 8. Populate Attendance (Sample logs)
INSERT INTO attendance (id, student_id, course_id, date, status, remarks) VALUES
(1, 4, 1, '2026-07-21', 'PRESENT', 'On time'),
(2, 4, 1, '2026-07-22', 'PRESENT', 'On time'),
(3, 4, 1, '2026-07-23', 'ABSENT', 'Medical leave'),
(4, 5, 1, '2026-07-21', 'PRESENT', 'On time'),
(5, 5, 1, '2026-07-22', 'PRESENT', 'On time'),
(6, 5, 1, '2026-07-23', 'PRESENT', 'On time');

-- 9. Populate Marks (Internal Assessments)
INSERT INTO marks (id, student_id, course_id, exam_type, marks_obtained, max_marks, grade) VALUES
(1, 4, 1, 'INTERNAL_1', 18.5, 20, 'O'),
(2, 4, 1, 'INTERNAL_2', 17.0, 20, 'A'),
(3, 5, 1, 'INTERNAL_1', 19.0, 20, 'O'),
(4, 5, 1, 'INTERNAL_2', 18.0, 20, 'O');

-- 10. Populate Hostels
INSERT INTO hostels (id, name, type, capacity, address) VALUES
(1, 'Ramanujan Boys Hostel', 'BOYS', 200, 'North Campus, College Ground'),
(2, 'Kalpana Chawla Girls Hostel', 'GIRLS', 150, 'East Campus, College Gate 2');

-- 11. Populate Hostel Rooms
INSERT INTO hostel_rooms (id, hostel_id, room_number, capacity, occupancy, rent_per_semester) VALUES
(1, 1, 'A-101', 2, 1, 15000.00),
(2, 1, 'A-102', 2, 1, 15000.00),
(3, 2, 'G-201', 2, 1, 16000.00);

-- 12. Allocate Rooms to Students
INSERT INTO hostel_allocations (id, student_id, room_id, allocation_date, status) VALUES
(1, 4, 1, '2026-07-20', 'ACTIVE'),
(2, 5, 3, '2026-07-20', 'ACTIVE'),
(3, 6, 2, '2026-07-20', 'ACTIVE');

-- 13. Populate Library Books
INSERT INTO library_books (id, title, author, isbn, publisher, total_copies, available_copies, category) VALUES
(1, 'Fundamentals of Database Systems', 'Elmasri & Navathe', '978-0133970777', 'Pearson', 5, 4, 'DBMS'),
(2, 'Operating System Concepts', 'Silberschatz & Galvin', '978-1118063330', 'Wiley', 5, 5, 'Operating Systems'),
(3, 'Modern Digital Signal Processing', 'Roberto Cristi', '978-0534400957', 'Cengage', 3, 3, 'ECE');

-- 14. Library Book Issues
INSERT INTO library_issues (id, student_id, book_id, issue_date, due_date, status) VALUES
(1, 4, 1, '2026-07-24', '2026-08-07', 'ISSUED');

-- 15. Placement Drives
INSERT INTO placement_drives (id, company_name, drive_date, role, package_lpa, minimum_cgpa, status) VALUES
(1, 'Google India', '2026-10-15', 'Software Engineer Intern', 24.50, 8.5, 'UPCOMING'),
(2, 'Infosys Ltd', '2026-11-02', 'Systems Engineer', 4.50, 6.0, 'UPCOMING');

-- 16. Placement Applications
INSERT INTO placement_applications (id, drive_id, student_id, status, application_date) VALUES
(1, 1, 4, 'APPLIED', '2026-07-24');

-- 17. Populate Notifications
INSERT INTO notifications (id, title, message, target_role, date) VALUES
(1, 'Welcome to Academic Year 2026-2027', 'Classes for all semesters resume on July 27th, 2026. Please check your timetable.', 'ALL', '2026-07-25'),
(2, 'Internship Drive: Google India', 'Applications are open for Google SWE Intern positions. Eligible students can apply under Placements.', 'STUDENT', '2026-07-25'),
(3, 'Faculty Meeting', 'A meeting to discuss the mid-semester evaluation is scheduled for July 29th at 3 PM in Seminar Hall 1.', 'FACULTY', '2026-07-25');
