# Task 2: Update Student Model, DTO, Repository, and Service for Year of Study and Clean CRUD

## Contexto
The user requires these exact fields for each student:
- Student ID (automatically generated)
- Registration Number (unique)
- Full Name
- Email (unique if provided)
- Department
- Year of Study (e.g. 1st Year, 2nd Year, 3rd Year, 4th Year, or 1, 2, 3, 4)
- Phone Number

We need to make sure:
- `Student.java` and `StudentDto.java` have `yearOfStudy` (or `year`) and `fullName` (or firstName + lastName / fullName).
- `StudentRepository.java` has a clean, correct `@Query` for search (by full name, first name, last name, or registration/roll number) and department filtering.
- `StudentServiceImpl.java` handles CRUD operations cleanly:
  - Add: generates user/student record, validates duplicate registration number and email.
  - View by ID: returns complete student details.
  - Update: updates profile fields cleanly without foreign key / orphan issues.
  - Delete: deletes the student record reliably.
  - Search & Filter: returns students filtered by department and search text.

## Subtareas
- [x] Add `yearOfStudy` to `Student.java`, `StudentDto.java`, and update mapping methods in `StudentServiceImpl.java`.
- [x] Fix search and filter queries in `StudentRepository.java` using `@Query` with correct operator grouping `(departmentId IS NULL OR s.department.id = :departmentId) AND (LOWER(s.rollNumber) LIKE ... OR LOWER(s.firstName) LIKE ... OR ...)`.
- [x] Ensure `StudentController.java` endpoints: GET `/api/students`, GET `/api/students/{id}`, POST `/api/students`, PUT `/api/students/{id}`, DELETE `/api/students/{id}` operate cleanly and handle validation errors.
