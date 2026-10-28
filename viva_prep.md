# 🎓 DBMS Project Viva Q&A & Interview Prep Sheet

This document compiles the most common questions asked by university external examiners during third-year B.Tech B.E. Computer Science/IT project vivas, detailed with reference explanations of how they are implemented in this **College Management System (CMS)**.

---

## 📂 Section 1: Database Design & Normalization

### Q1: What database normal form does this project use? Explain how it is achieved.
**Answer**: This project is designed in **3rd Normal Form (3NF)**.
* **1NF (First Normal Form)**: All table cells contain atomic values (single values, no comma-separated lists), and each record has a unique identifier (Primary Key).
* **2NF (Second Normal Form)**: The table is in 1NF and all non-key attributes are fully functionally dependent on the primary key (no partial dependency). In our composite key table `course_faculty` (composed of `course_id` and `faculty_id`), the audit columns like `semester` depend on both keys.
* **3NF (Third Normal Form)**: The table is in 2NF and there is no transitive dependency (non-key columns depending on other non-key columns). For example, the `students` table does not store department information like `department_address` or `hod_name`; it only stores a foreign key `department_id` referencing the `departments` table.

### Q2: Why is the `Student` entity separate from the `User` entity? Why not store everything in one table?
**Answer**: We use a **shared primary key mapping strategy (1-to-1 relationship)** mapped via `@MapsId` in Hibernate.
* **Separation of Concerns**: The `users` table handles authentication credentials (username, hashed passwords, roles), which remains small and fast to scan.
* **Profile Isolation**: Profile metadata (DOB, address, department) belongs in the `students` or `faculty` tables.
* **BLOB/Performance Optimization**: If we stored profile images or large texts in the authentication table, it would bloat memory reads during login queries.

### Q3: Why is the Student CGPA calculated dynamically rather than stored in a column?
**Answer**: Storing CGPA directly in the `students` table violates **3NF** because CGPA is a derived value dependent on the scores in the `marks` table.
* **Update Anomalies**: If a student's marks change, a hardcoded CGPA column would become out of sync unless explicitly updated.
* **Implementation**: We calculate it on-the-fly in `PlacementServiceImpl.java` using a SQL query/JPA mapping that computes:
  \[\text{CGPA} = \frac{\sum (\text{Grade Points} \times \text{Course Credits})}{\sum (\text{Course Credits})}\]
  This guarantees that the CGPA is always accurate and consistent.

---

## 🔒 Section 2: ACID Transactions & Concurrency

### Q4: What are ACID properties? Give an example of how they are maintained in this project.
**Answer**: ACID stands for:
1. **Atomicity**: All operations in a transaction succeed, or all fail (roll back).
   * *Example*: When registering a student, we insert a record into the `users` table AND the `students` table inside a single method annotated with `@Transactional`. If the profile insert fails, the user credential record is rolled back automatically.
2. **Consistency**: Transactions bring the database from one valid state to another.
   * *Example*: Uniqueness constraints (e.g. unique student roll numbers) are validated before commit.
3. **Isolation**: Concurrent execution of transactions leaves the database in the same state as if they ran sequentially.
   * *Example*: Spring Boot default isolation levels handle read/write locks.
4. **Durability**: Once committed, data remains saved even in case of power failure.
   * *Example*: Persistent file writing in the local H2 engine.

### Q5: How do you prevent a student from registering for the same elective course twice?
**Answer**: We implement a double defense:
1. **Database Constraint**: We set a unique index constraint on `(student_id, course_id)` in the `course_enrollments` table.
2. **Service Layer Validation**: Before creating a registration, `CourseEnrollmentServiceImpl` queries `enrollmentRepository.findByStudentIdAndCourseId` and throws a custom `ApiException` if an active enrollment exists.

---

## 💻 Section 3: Spring Boot & ORM (JPA/Hibernate)

### Q6: What is the difference between Lazy Loading and Eager Loading? Which did you use?
**Answer**:
* **Eager Loading (`FetchType.EAGER`)**: Automatically fetches child records when fetching parent records. This is bad for performance because it triggers unnecessary JOIN queries (the N+1 query problem).
* **Lazy Loading (`FetchType.LAZY`)**: Fetches child records only when they are accessed in code (e.g. `student.getDepartment()`).
* *Project Implementation*: We set all `@ManyToOne` relationships to `FetchType.LAZY` (e.g. in `Student.java` and `Marks.java`) to keep queries optimized.

### Q7: What is an ORM? What are the benefits of Spring Data JPA?
**Answer**: **Object-Relational Mapping (ORM)** is a technique to map database tables to Java classes (entities).
* **Hibernate** is the ORM framework implementing the JPA standard.
* **Spring Data JPA** simplifies this further by generating SQL queries automatically from method signatures (e.g. `findByStudentIdAndCourseId(...)` is generated by Spring without writing a single line of SQL!).

---

## 🛡️ Section 4: Security & Authentication

### Q8: How does JWT (JSON Web Token) authentication work in this system?
**Answer**:
1. The client POSTs credentials to `/api/auth/login`.
2. The server validates the credentials and signs a JWT containing the user's role and username.
3. The client saves this token in `localStorage`.
4. For all subsequent API calls, the client includes this token in the `Authorization` header: `Bearer <token>`.
5. The server uses a custom filter `JwtAuthenticationFilter` to validate the token on every request, keeping the session **stateless** (the server does not store session IDs, saving memory).

### Q9: How are passwords secured in the database?
**Answer**: We never store plain text passwords. We configure Spring Security to use **`BCryptPasswordEncoder`**. Password hashes are computed using a secure salt value, making them computationally impossible to decrypt or brute-force in case of database leaks.
