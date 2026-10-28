-- DATABASE SCHEMA FOR COLLEGE MANAGEMENT SYSTEM (3NF Normalized)
-- Database: MySQL / H2 compatible

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Core Auth Credentials)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL, -- 'ADMIN', 'FACULTY', 'STUDENT'
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Students Table (References Users for login and Departments for course stream)
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY, -- Same as users.id (1-to-1 relationship)
    roll_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    year_of_study INT DEFAULT 1 CHECK (year_of_study BETWEEN 1 AND 4),
    date_of_birth DATE,
    gender VARCHAR(10),
    phone VARCHAR(15) UNIQUE,
    address TEXT,
    admission_date DATE,
    department_id INT,
    profile_picture_url VARCHAR(255),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 4. Faculty Table (References Users for login and Departments)
CREATE TABLE IF NOT EXISTS faculty (
    id INT PRIMARY KEY, -- Same as users.id (1-to-1 relationship)
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    designation VARCHAR(50) NOT NULL,
    phone VARCHAR(15) UNIQUE,
    address TEXT,
    joining_date DATE NOT NULL,
    department_id INT,
    profile_picture_url VARCHAR(255),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 5. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    credits INT NOT NULL CHECK (credits > 0),
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 6. Course-Faculty Assignment Table (Many-to-Many link table with audit attributes)
CREATE TABLE IF NOT EXISTS course_faculty (
    course_id INT,
    faculty_id INT,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    academic_year VARCHAR(9) NOT NULL, -- e.g., '2026-2027'
    PRIMARY KEY (course_id, faculty_id, semester, academic_year),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
);

-- 7. Course Enrollments Table (Many-to-Many link for students enrolling in courses)
CREATE TABLE IF NOT EXISTS course_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    course_id INT,
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'COMPLETED', 'DROPPED'
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (student_id, course_id)
);

-- 8. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    course_id INT,
    date DATE NOT NULL,
    status VARCHAR(10) NOT NULL, -- 'PRESENT', 'ABSENT', 'LATE'
    remarks VARCHAR(255),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (student_id, course_id, date)
);

-- 9. Marks/Examination Table
CREATE TABLE IF NOT EXISTS marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    course_id INT,
    exam_type VARCHAR(20) NOT NULL, -- 'INTERNAL_1', 'INTERNAL_2', 'SEMESTER'
    marks_obtained DECIMAL(5,2) NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL,
    grade VARCHAR(2),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (student_id, course_id, exam_type)
);

-- 10. Hostels Table
CREATE TABLE IF NOT EXISTS hostels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(10) NOT NULL, -- 'BOYS', 'GIRLS'
    capacity INT NOT NULL CHECK (capacity > 0),
    address TEXT
);

-- 11. Hostel Rooms Table
CREATE TABLE IF NOT EXISTS hostel_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_id INT,
    room_number VARCHAR(10) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    occupancy INT DEFAULT 0 CHECK (occupancy >= 0),
    rent_per_semester DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
    UNIQUE (hostel_id, room_number)
);

-- 12. Hostel Allocations Table
CREATE TABLE IF NOT EXISTS hostel_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    room_id INT,
    allocation_date DATE NOT NULL,
    vacated_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'VACATED'
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES hostel_rooms(id) ON DELETE CASCADE
);

-- 13. Library Books Table
CREATE TABLE IF NOT EXISTS library_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    publisher VARCHAR(100),
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    category VARCHAR(50)
);

-- 14. Library Issues Table
CREATE TABLE IF NOT EXISTS library_issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    book_id INT,
    issue_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'ISSUED', -- 'ISSUED', 'RETURNED', 'OVERDUE'
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES library_books(id) ON DELETE CASCADE
);

-- 15. Placements Table (Recruitment Drives)
CREATE TABLE IF NOT EXISTS placements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    drive_date DATE NOT NULL,
    job_profile VARCHAR(100) NOT NULL,
    package_lpa DECIMAL(5,2) NOT NULL,
    eligibility_criteria TEXT,
    status VARCHAR(20) DEFAULT 'UPCOMING' -- 'UPCOMING', 'ONGOING', 'COMPLETED'
);

-- 16. Placement Applications Table
CREATE TABLE IF NOT EXISTS placement_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placement_id INT,
    student_id INT,
    status VARCHAR(20) DEFAULT 'APPLIED', -- 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'
    round_reached VARCHAR(50),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (placement_id) REFERENCES placements(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE (placement_id, student_id)
);

-- 17. Fee Structure Table
CREATE TABLE IF NOT EXISTS fees_structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT,
    academic_year VARCHAR(9) NOT NULL,
    semester INT NOT NULL,
    tuition_fee DECIMAL(10,2) NOT NULL,
    hostel_fee DECIMAL(10,2) DEFAULT 0.00,
    library_fee DECIMAL(10,2) DEFAULT 0.00,
    other_fees DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    UNIQUE (department_id, academic_year, semester)
);

-- 18. Student Fees Table (Tracks billing per student)
CREATE TABLE IF NOT EXISTS student_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    fee_structure_id INT,
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    due_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'UNPAID', -- 'PAID', 'PARTIALLY_PAID', 'UNPAID'
    last_payment_date DATE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_structure_id) REFERENCES fees_structure(id) ON DELETE CASCADE
);

-- 19. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    target_role VARCHAR(20) DEFAULT 'ALL', -- 'ALL', 'STUDENT', 'FACULTY', 'ADMIN'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
