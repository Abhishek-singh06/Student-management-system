# Task 4: Redesign Frontend with Clean College Styling, Dashboard, and Student Management

## Contexto
The user explicitly specified:
- White or light-grey background (`#f8fafc` or `#f3f4f6`)
- Blue as primary accent color (`#1e40af` or `#2563eb`)
- Dark text with good contrast (`#0f172a`, `#1e293b`)
- Clean sidebar or top navigation with only:
  1. Dashboard
  2. Manage Students
- Remove or hide unnecessary modules: Hostel, Library, Placement, Timetable, Attendance, Marks, Faculty, Course Enrollment, Notifications.
- Dashboard with:
  1. Total Students card
  2. Number of Departments card
  3. "Add Student" primary action button
  4. Recent Students table
- Student Management with:
  1. Search input (name or registration number)
  2. Department filter dropdown
  3. Clean Student Table (ID, Reg No, Full Name, Email, Department, Year of Study, Phone, Actions)
  4. Add / Edit Student modal with clean validation & clear error messages
  5. Student Details modal (view full info)
  6. Delete confirmation dialog
- No glassmorphic blur, no dark-only neon gradients, clean and professional for university evaluation.

## Subtareas
- [x] Create a clean, bright, professional layout and navigation (Dashboard + Manage Students).
- [x] Build the simplified Dashboard component with stat cards (Total Students, Total Departments), Quick Add button, and Recent Students table.
- [x] Build the Student Management component with Search, Department Filter, Add/Edit Modal, View Details Modal, and Delete Confirmation Dialog.
- [x] Connect all frontend actions to the real backend API (`api.get('/students')`, `api.post('/students')`, etc.).
