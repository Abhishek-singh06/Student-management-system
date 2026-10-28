# Task 3: Simplify Database Schema, Seed Data, and Department Support

## Contexto
The database should represent a clean DBMS schema:
- `students` table with `id` (PK), `roll_number` (Registration Number, UNIQUE), `first_name`, `last_name`, `email` (UNIQUE), `department_id` (FK referencing `departments`), `year_of_study`, `phone`, etc.
- `departments` table with `id` (PK), `name` (UNIQUE), `code`.
- `backend/src/main/resources/data.sql` and `database/data.sql` should seed clear sample departments and representative student records across departments.
- Ensure `database/schema.sql` is updated and matches the tables.

## Subtareas
- [x] Add `year_of_study` column to `database/schema.sql` and `backend/src/main/resources/data.sql`.
- [x] Provide 8-10 diverse sample students across CSE, ECE, ME, and IT departments in `data.sql` with realistic Indian college names and registration numbers.
