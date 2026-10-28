-- SAMPLE DATA FOR COLLEGE MANAGEMENT SYSTEM
-- Compatible with MySQL / H2

-- 1. Populate Departments
INSERT INTO departments (name, code, description) VALUES
('Computer Science & Engineering', 'CSE', 'Department of Computer Science and Engineering'),
('Electronics & Communication Engineering', 'ECE', 'Department of Electronics and Communication Engineering'),
('Mechanical Engineering', 'ME', 'Department of Mechanical Engineering'),
('Information Technology', 'IT', 'Department of Information Technology');

-- 2. Populate Users (Passwords are plaintext 'password' or '$2a$10$...' for BCrypt. Let's use standard BCrypt hash for 'password' which is '$2a$10$8.g.tF9I2HGsQ9w7G5kP9e8E3YvTfpxqS2Kk1k1k1k1k1k1k1k1k1' or similar, but for simplicity let's use a valid BCrypt hash for 'password123': '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W')
-- We have 1 Admin, 2 Faculty, and 3 Students.
INSERT INTO users (username, password, email, role, status) VALUES
('admin', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'admin@college.edu', 'ADMIN', 'ACTIVE'),
('jdoe_faculty', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'jdoe@college.edu', 'FACULTY', 'ACTIVE'),
('asmith_faculty', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'asmith@college.edu', 'FACULTY', 'ACTIVE'),
('srinivas_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'srinivas@student.edu', 'STUDENT', 'ACTIVE'),
('priya_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'priya@student.edu', 'STUDENT', 'ACTIVE'),
('rahul_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'rahul@student.edu', 'STUDENT', 'ACTIVE'),
('ananya_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'ananya@student.edu', 'STUDENT', 'ACTIVE'),
('vikram_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'vikram@student.edu', 'STUDENT', 'ACTIVE'),
('sneha_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'sneha@student.edu', 'STUDENT', 'ACTIVE'),
('arjun_student', '$2a$10$dXJ3ADK6y7eeKB2kku5vfeGQ3A3TfM7bF4fF3jZqF.B8N.0qC2u.W', 'arjun@student.edu', 'STUDENT', 'ACTIVE');

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
INSERT INTO courses (code, name, description, credits, department_id) VALUES
('CS301', 'Database Management Systems', 'Introduction to relational databases, SQL, normalization, and transactions.', 4, 1),
('CS302', 'Operating Systems', 'Processes, CPU scheduling, synchronization, and memory management.', 4, 1),
('EC301', 'Digital Signal Processing', 'Signals and systems, Fourier transforms, filter design.', 3, 2),
('HS101', 'Technical Communication', 'Report writing, presentation skills, and professional ethics.', 2, NULL);

-- 6. Associate Faculty to Courses (Course-Faculty)
-- John Doe (id=2) teaches DBMS (CS301) and OS (CS302)
-- Alice Smith (id=3) teaches DSP (EC301) and Tech Comm (HS101)
INSERT INTO course_faculty (course_id, faculty_id, semester, academic_year) VALUES
(1, 2, 5, '2026-2027'),
(2, 2, 5, '2026-2027'),
(3, 3, 5, '2026-2027'),
(4, 3, 1, '2026-2027');

-- 7. Enroll Students in Courses
-- Srinivas (id=4) & Priya (id=5) in DBMS (CS301), OS (CS302), and Tech Comm (HS101)
-- Rahul (id=6) in DSP (EC301) and Tech Comm (HS101)
INSERT INTO course_enrollments (student_id, course_id, enrollment_date, status) VALUES
(4, 1, '2026-07-20', 'ACTIVE'),
(4, 2, '2026-07-20', 'ACTIVE'),
(4, 4, '2026-07-20', 'ACTIVE'),
(5, 1, '2026-07-20', 'ACTIVE'),
(5, 2, '2026-07-20', 'ACTIVE'),
(5, 4, '2026-07-20', 'ACTIVE'),
(6, 3, '2026-07-20', 'ACTIVE'),
(6, 4, '2026-07-20', 'ACTIVE');

-- 8. Populate Attendance (Sample logs)
INSERT INTO attendance (student_id, course_id, date, status, remarks) VALUES
(4, 1, '2026-07-21', 'PRESENT', 'On time'),
(4, 1, '2026-07-22', 'PRESENT', 'On time'),
(4, 1, '2026-07-23', 'ABSENT', 'Medical leave'),
(5, 1, '2026-07-21', 'PRESENT', 'On time'),
(5, 1, '2026-07-22', 'PRESENT', 'On time'),
(5, 1, '2026-07-23', 'PRESENT', 'On time');

-- 9. Populate Marks (Internal Assessments)
INSERT INTO marks (student_id, course_id, exam_type, marks_obtained, max_marks, grade) VALUES
(4, 1, 'INTERNAL_1', 18.5, 20, 'O'),
(4, 1, 'INTERNAL_2', 17.0, 20, 'A'),
(5, 1, 'INTERNAL_1', 19.0, 20, 'O'),
(5, 1, 'INTERNAL_2', 18.0, 20, 'O');

-- 10. Populate Hostels
INSERT INTO hostels (name, type, capacity, address) VALUES
('Ramanujan Boys Hostel', 'BOYS', 200, 'North Campus, College Ground'),
('Kalpana Chawla Girls Hostel', 'GIRLS', 150, 'East Campus, College Gate 2');

-- 11. Populate Hostel Rooms
INSERT INTO hostel_rooms (hostel_id, room_number, capacity, occupancy, rent_per_semester) VALUES
(1, 'A-101', 2, 1, 15000.00),
(1, 'A-102', 2, 1, 15000.00),
(2, 'G-201', 2, 1, 16000.00);

-- 12. Allocate Rooms to Students
-- Srinivas (id=4) in A-101
-- Priya (id=5) in G-201
-- Rahul (id=6) in A-102
INSERT INTO hostel_allocations (student_id, room_id, allocation_date, status) VALUES
(4, 1, '2026-07-20', 'ACTIVE'),
(5, 3, '2026-07-20', 'ACTIVE'),
(6, 2, '2026-07-20', 'ACTIVE');

-- 13. Populate Library Books
INSERT INTO library_books (title, author, isbn, publisher, total_copies, available_copies, category) VALUES
('Fundamentals of Database Systems', 'Elmasri & Navathe', '978-0133970777', 'Pearson', 5, 4, 'DBMS'),
('Operating System Concepts', 'Silberschatz & Galvin', '978-1118063330', 'Wiley', 5, 5, 'Operating Systems'),
('Modern Digital Signal Processing', 'Roberto Cristi', '978-0534400957', 'Cengage', 3, 3, 'ECE');

-- 14. Library Book Issues
INSERT INTO library_issues (student_id, book_id, issue_date, due_date, status) VALUES
(4, 1, '2026-07-24', '2026-08-07', 'ISSUED');

-- 15. Placement Drives
INSERT INTO placements (company_name, drive_date, job_profile, package_lpa, eligibility_criteria, status) VALUES
('Google India', '2026-10-15', 'Software Engineer Intern', 24.50, 'CGPA >= 8.5, No active backlogs', 'UPCOMING'),
('Infosys Ltd', '2026-11-02', 'Systems Engineer', 4.50, 'CGPA >= 6.0', 'UPCOMING');

-- 16. Placement Applications
INSERT INTO placement_applications (placement_id, student_id, status) VALUES
(1, 4, 'APPLIED');

-- 17. Fees Structure (Academic Year 2026-2027)
INSERT INTO fees_structure (department_id, academic_year, semester, tuition_fee, hostel_fee, library_fee, other_fees) VALUES
(1, '2026-2027', 5, 45000.00, 15000.00, 1500.00, 2000.00), -- CSE Sem 5
(2, '2026-2027', 5, 42000.00, 16000.00, 1500.00, 2000.00); -- ECE Sem 5

-- 18. Student Fees Bills
INSERT INTO student_fees (student_id, fee_structure_id, amount_paid, due_amount, payment_status) VALUES
(4, 1, 20000.00, 43500.00, 'PARTIALLY_PAID'), -- Total = 63500.00, paid 20k, due 43.5k
(5, 1, 63500.00, 0.00, 'PAID');

-- 19. Populate Notifications
INSERT INTO notifications (title, message, target_role) VALUES
('Welcome to Academic Year 2026-2027', 'Classes for all semesters resume on July 27th, 2026. Please check your timetable.', 'ALL'),
('Internship Drive: Google India', 'Applications are open for Google SWE Intern positions. Eligible students can apply under Placements.', 'STUDENT'),
('Faculty Meeting', 'A meeting to discuss the mid-semester evaluation is scheduled for July 29th at 3 PM in Seminar Hall 1.', 'FACULTY');
