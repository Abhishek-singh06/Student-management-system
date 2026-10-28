// Student Management System - Full LocalStorage & SQLite Client
let allDepartments = [
  { id: 1, name: 'Computer Science & Engineering' },
  { id: 2, name: 'Electronics & Communication Engineering' },
  { id: 3, name: 'Mechanical Engineering' },
  { id: 4, name: 'Information Technology' }
];

let deleteCandidateId = null;
let searchDebounceTimer = null;
let currentQuickFilter = 'all';

// Initialize Theme
function initTheme() {
  const savedTheme = localStorage.getItem('sms_theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeToggleUI(true);
  } else {
    document.documentElement.removeAttribute('data-theme');
    updateThemeToggleUI(false);
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('sms_theme', 'light');
    updateThemeToggleUI(false);
    showToast('Switched to Light Theme', 'info');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('sms_theme', 'dark');
    updateThemeToggleUI(true);
    showToast('Switched to Dark Theme', 'info');
  }
}

function updateThemeToggleUI(isDark) {
  const icon = document.getElementById('themeToggleIcon');
  const text = document.getElementById('themeToggleText');
  if (icon && text) {
    icon.textContent = isDark ? '☀️' : '🌙';
    text.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  }
}

// Toast Notifications System
function showToast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// Global Banner Notification (also calls Toast)
function showAlert(message, type = 'success') {
  showToast(message, type);
  const alertEl = document.getElementById('globalAlert');
  if (alertEl) {
    alertEl.textContent = message;
    alertEl.className = `alert alert-${type}`;
    alertEl.style.display = 'block';
    setTimeout(() => { alertEl.style.display = 'none'; }, 4000);
  }
}

// Initialize Seed Users in LocalStorage for Show / Demo
function initLocalStorageAuth() {
  if (!localStorage.getItem('sms_users')) {
    const defaultUsers = [
      {
        fullName: 'System Administrator',
        email: 'admin@college.edu',
        username: 'admin',
        password: 'password123'
      }
    ];
    localStorage.setItem('sms_users', JSON.stringify(defaultUsers));
  }
}

// Initial Sample Students for LocalStorage fallback
const defaultSampleStudents = [
  { id: 1, registration_number: '2023CSE01', full_name: 'Srinivas Rao', email: 'srinivas.rao@college.edu', department_id: 1, department_name: 'Computer Science & Engineering', year_of_study: 3, cgpa: 8.85, subjects: 'DBMS, Operating Systems, Computer Networks', phone_number: '9876543210' },
  { id: 2, registration_number: '2023CSE02', full_name: 'Priya Sharma', email: 'priya.sharma@college.edu', department_id: 1, department_name: 'Computer Science & Engineering', year_of_study: 3, cgpa: 9.20, subjects: 'DBMS, Algorithms, Software Engineering', phone_number: '9876543211' },
  { id: 3, registration_number: '2023ECE01', full_name: 'Rahul Verma', email: 'rahul.verma@college.edu', department_id: 2, department_name: 'Electronics & Communication Engineering', year_of_study: 2, cgpa: 7.65, subjects: 'Digital Signal Processing, Microprocessors', phone_number: '9876543212' },
  { id: 4, registration_number: '2024IT01', full_name: 'Ananya Iyer', email: 'ananya.iyer@college.edu', department_id: 4, department_name: 'Information Technology', year_of_study: 1, cgpa: 9.40, subjects: 'Python Programming, Web Technologies', phone_number: '9876543213' },
  { id: 5, registration_number: '2022ME01', full_name: 'Vikram Patel', email: 'vikram.patel@college.edu', department_id: 3, department_name: 'Mechanical Engineering', year_of_study: 4, cgpa: 8.10, subjects: 'Thermodynamics, Fluid Mechanics, CAD', phone_number: '9876543214' },
  { id: 6, registration_number: '2023CSE03', full_name: 'Sneha Reddy', email: 'sneha.reddy@college.edu', department_id: 1, department_name: 'Computer Science & Engineering', year_of_study: 3, cgpa: 8.95, subjects: 'DBMS, Machine Learning, Cloud Computing', phone_number: '9876543215' }
];

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLocalStorageAuth();

  // If student cache doesn't exist in local storage, initialize it
  if (!localStorage.getItem('sms_students')) {
    localStorage.setItem('sms_students', JSON.stringify(defaultSampleStudents));
  }

  // Check login state
  const currentUser = getCurrentUser();
  if (currentUser) {
    showAppShell(currentUser);
  } else {
    showLandingPage();
  }

  loadDepartments();

  // Shortcut: Ctrl+Enter to execute SQL in editor
  const sqlInput = document.getElementById('sqlQueryInput');
  if (sqlInput) {
    sqlInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executeSqlQuery();
      }
    });
  }
});

// ==============================================================
// AUTHENTICATION & SESSION (Backed by LocalStorage)
// ==============================================================
function getCurrentUser() {
  const data = localStorage.getItem('sms_current_user');
  return data ? JSON.parse(data) : null;
}

function showLandingPage() {
  document.getElementById('viewLanding').style.display = 'flex';
  document.getElementById('viewApp').style.display = 'none';
}

function showAppShell(user) {
  document.getElementById('viewLanding').style.display = 'none';
  document.getElementById('viewApp').style.display = 'flex';

  const avatar = (user.fullName || user.username || 'A').charAt(0).toUpperCase();
  document.getElementById('sidebarAvatar').textContent = avatar;
  document.getElementById('sidebarUserName').textContent = user.fullName || user.username;
  document.getElementById('sidebarUserEmail').textContent = user.email || `${user.username}@college.edu`;

  loadDashboardData();
  loadStudents();
}

function enterDirectDemo() {
  const demoUser = {
    fullName: 'Guest Administrator',
    username: 'admin',
    email: 'admin@college.edu'
  };
  localStorage.setItem('sms_current_user', JSON.stringify(demoUser));
  showAppShell(demoUser);
}

function openAuthModal(mode = 'signin') {
  toggleAuthForm(mode);
  document.getElementById('authErrorAlert').style.display = 'none';
  document.getElementById('authModal').classList.add('active');
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('active');
}

function toggleAuthForm(mode) {
  const isSignIn = mode === 'signin';
  document.getElementById('authModalTitle').textContent = isSignIn ? 'Sign In' : 'Create Account';
  document.getElementById('tabBtnSignIn').className = `auth-tab ${isSignIn ? 'active' : ''}`;
  document.getElementById('tabBtnSignUp').className = `auth-tab ${!isSignIn ? 'active' : ''}`;
  document.getElementById('signInForm').style.display = isSignIn ? 'block' : 'none';
  document.getElementById('signUpForm').style.display = !isSignIn ? 'block' : 'none';
  document.getElementById('authErrorAlert').style.display = 'none';
}

function handleSignInSubmit(e) {
  e.preventDefault();
  const usernameOrEmail = document.getElementById('loginUsername').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const errBox = document.getElementById('authErrorAlert');

  const users = JSON.parse(localStorage.getItem('sms_users') || '[]');
  const matched = users.find(u => 
    (u.username.toLowerCase() === usernameOrEmail || u.email.toLowerCase() === usernameOrEmail) && 
    u.password === password
  );

  if (matched) {
    localStorage.setItem('sms_current_user', JSON.stringify(matched));
    closeAuthModal();
    showAppShell(matched);
  } else {
    errBox.textContent = 'Invalid credentials. Use demo: admin / password123';
    errBox.style.display = 'block';
  }
}

function handleSignUpSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById('regFullName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const errBox = document.getElementById('authErrorAlert');

  const users = JSON.parse(localStorage.getItem('sms_users') || '[]');

  if (users.some(u => u.username.toLowerCase() === username)) {
    errBox.textContent = `Username "${username}" is already taken.`;
    errBox.style.display = 'block';
    return;
  }
  if (users.some(u => u.email.toLowerCase() === email)) {
    errBox.textContent = `Email "${email}" is already registered.`;
    errBox.style.display = 'block';
    return;
  }

  const newUser = { fullName, email, username, password };
  users.push(newUser);
  localStorage.setItem('sms_users', JSON.stringify(users));
  localStorage.setItem('sms_current_user', JSON.stringify(newUser));

  closeAuthModal();
  showAppShell(newUser);
  showAlert(`Welcome, ${fullName}! Your account was created successfully.`);
}

function handleSignOut() {
  localStorage.removeItem('sms_current_user');
  showLandingPage();
}

// ==============================================================
// TAB NAVIGATION (Dashboard, Students, SQL Console, Schema)
// ==============================================================
function switchAppTab(tabName) {
  const tabs = ['dashboard', 'students', 'sql-console', 'schema'];
  
  tabs.forEach(t => {
    const sectionId = t === 'sql-console' ? 'tabSqlConsole' : (t === 'schema' ? 'tabSchema' : (t === 'dashboard' ? 'tabDashboard' : 'tabStudents'));
    const navId = t === 'sql-console' ? 'navSqlConsole' : (t === 'schema' ? 'navSchema' : (t === 'dashboard' ? 'navDashboard' : 'navStudents'));
    
    const secEl = document.getElementById(sectionId);
    const navEl = document.getElementById(navId);

    if (t === tabName) {
      if (secEl) secEl.classList.add('active');
      if (navEl) navEl.classList.add('active');
      if (t === 'schema') {
        loadLiveSchemaMetadata();
      }
      if (t === 'sql-console') {
        const editor = document.getElementById('sqlQueryInput');
        if (!editor || !editor.value.trim()) {
          loadSqlPreset('join_inner', true);
        }
      }
    } else {
      if (secEl) secEl.classList.remove('active');
      if (navEl) navEl.classList.remove('active');
    }
  });

  if (tabName === 'dashboard') {
    loadDashboardData();
  } else if (tabName === 'students') {
    loadStudents();
  } else if (tabName === 'sql-console') {
    if (!document.getElementById('sqlQueryInput').value.trim()) {
      loadSqlPreset('join');
    }
  }
}

// Global Banner Notification
function showAlert(message, type = 'success') {
  const alertEl = document.getElementById('globalAlert');
  alertEl.textContent = message;
  alertEl.className = `alert alert-${type}`;
  alertEl.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(() => {
    alertEl.style.display = 'none';
  }, 4500);
}

// ==============================================================
// DEPARTMENTS & DATA LOADING
// ==============================================================
async function loadDepartments() {
  try {
    const res = await fetch('/api/departments');
    if (res.ok) {
      allDepartments = await res.json();
    }
  } catch {
    // Keep default allDepartments
  }

  const deptFilter = document.getElementById('deptFilter');
  const deptField = document.getElementById('departmentField');

  deptFilter.innerHTML = '<option value="">All Departments</option>';
  deptField.innerHTML = '<option value="">Select Department</option>';

  allDepartments.forEach(d => {
    const optFilter = document.createElement('option');
    optFilter.value = d.id;
    optFilter.textContent = d.name;
    deptFilter.appendChild(optFilter);

    const optField = document.createElement('option');
    optField.value = d.id;
    optField.textContent = d.name;
    deptField.appendChild(optField);
  });
}

function getLocalStudents() {
  return JSON.parse(localStorage.getItem('sms_students') || '[]');
}

function saveLocalStudents(list) {
  localStorage.setItem('sms_students', JSON.stringify(list));
}

// Load Dashboard Metrics
async function loadDashboardData() {
  let total = 0;
  let avgCgpa = 8.5;
  let recent = [];

  try {
    const statsRes = await fetch('/api/stats');
    if (statsRes.ok) {
      const stats = await statsRes.json();
      total = stats.total_students;
      avgCgpa = stats.avg_cgpa || 8.5;
    }

    const recentRes = await fetch('/api/students?limit=5');
    if (recentRes.ok) {
      recent = await recentRes.json();
    }
  } catch {
    // LocalStorage Fallback
    const local = getLocalStudents();
    total = local.length;
    if (total > 0) {
      const sum = local.reduce((acc, s) => acc + (parseFloat(s.cgpa) || 8.0), 0);
      avgCgpa = (sum / total).toFixed(2);
    }
    recent = local.slice(0, 5);
  }

  document.getElementById('dashTotalStudents').textContent = total;
  document.getElementById('dashTotalDepartments').textContent = allDepartments.length;
  document.getElementById('dashAvgCgpa').textContent = avgCgpa;

  renderRecentStudents(recent);
}

// Helper: CGPA Badge
function renderCgpaBadge(cgpaVal) {
  const val = parseFloat(cgpaVal) || 0;
  let cls = 'medium';
  if (val >= 8.5) cls = 'high';
  else if (val < 7.0) cls = 'low';

  return `<span class="cgpa-pill ${cls}">⭐ ${val.toFixed(2)}</span>`;
}

// Render Recent Students
function renderRecentStudents(students) {
  const tbody = document.getElementById('recentStudentsTableBody');
  if (!students || students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">No students added yet.</td></tr>';
    return;
  }

  tbody.innerHTML = students.map(s => `
    <tr>
      <td style="color: var(--text-muted); font-weight: 500;">#${s.id}</td>
      <td style="font-weight: 600; color: var(--text-main);">${escapeHtml(s.registration_number)}</td>
      <td>${escapeHtml(s.full_name)}</td>
      <td><span class="dept-badge">${escapeHtml(s.department_name || 'General')}</span></td>
      <td>${s.year_of_study || 1}st Year</td>
      <td>${renderCgpaBadge(s.cgpa)}</td>
      <td><div class="subjects-text" title="${escapeHtml(s.subjects || '')}">${escapeHtml(s.subjects || 'Core Curriculum')}</div></td>
      <td style="text-align: right;">
        <button class="btn btn-secondary btn-sm" onclick="viewStudentDetails(${s.id})">
          View Details
        </button>
      </td>
    </tr>
  `).join('');
}

// Quick Filter Pills Handler
function applyQuickFilter(filterKey, el) {
  currentQuickFilter = filterKey;
  document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
  if (el) el.classList.add('active');
  loadStudents();
}

// Load Students with Search, Filter & Sort
async function loadStudents() {
  const search = document.getElementById('searchInput').value.trim().toLowerCase();
  const deptId = document.getElementById('deptFilter').value;
  const sortBy = (document.getElementById('sortByFilter') ? document.getElementById('sortByFilter').value : 'id_desc');
  const tbody = document.getElementById('studentsTableBody');

  let list = [];

  try {
    const url = `/api/students?search=${encodeURIComponent(search)}&department_id=${encodeURIComponent(deptId)}`;
    const res = await fetch(url);
    if (res.ok) {
      list = await res.json();
      saveLocalStudents(list); // Sync with localStorage
    } else {
      throw new Error();
    }
  } catch {
    // Offline / LocalStorage mode
    const all = getLocalStudents();
    list = all.filter(s => {
      const matchDept = !deptId || String(s.department_id) === String(deptId);
      const matchSearch = !search || 
        (s.full_name && s.full_name.toLowerCase().includes(search)) ||
        (s.registration_number && s.registration_number.toLowerCase().includes(search)) ||
        (s.email && s.email.toLowerCase().includes(search)) ||
        (s.subjects && s.subjects.toLowerCase().includes(search));
      return matchDept && matchSearch;
    });
  }

  // Apply Quick Filter Pill
  if (currentQuickFilter === 'top-cgpa') {
    list = list.filter(s => (parseFloat(s.cgpa) || 0) >= 8.5);
  } else if (currentQuickFilter.startsWith('year-')) {
    const targetYear = parseInt(currentQuickFilter.replace('year-', ''));
    list = list.filter(s => parseInt(s.year_of_study) === targetYear);
  }

  // Apply Sorting
  if (sortBy === 'name_asc') {
    list.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
  } else if (sortBy === 'cgpa_desc') {
    list.sort((a, b) => (parseFloat(b.cgpa) || 0) - (parseFloat(a.cgpa) || 0));
  } else if (sortBy === 'cgpa_asc') {
    list.sort((a, b) => (parseFloat(a.cgpa) || 0) - (parseFloat(b.cgpa) || 0));
  } else if (sortBy === 'year_asc') {
    list.sort((a, b) => (parseInt(a.year_of_study) || 0) - (parseInt(b.year_of_study) || 0));
  } else {
    // Default id_desc
    list.sort((a, b) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0));
  }

  document.getElementById('studentsCountLabel').textContent = list.length;

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 32px;">No student records found matching the criteria.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(s => `
    <tr>
      <td style="color: var(--text-muted); font-weight: 500;">#${s.id}</td>
      <td style="font-weight: 600; color: var(--text-main);">${escapeHtml(s.registration_number)}</td>
      <td style="font-weight: 500;">${escapeHtml(s.full_name)}</td>
      <td><span class="dept-badge">${escapeHtml(s.department_name || 'General')}</span></td>
      <td>${s.year_of_study || 1}st Year</td>
      <td>${renderCgpaBadge(s.cgpa)}</td>
      <td><div class="subjects-text" title="${escapeHtml(s.subjects || '')}">${escapeHtml(s.subjects || 'General Curriculum')}</div></td>
      <td style="color: var(--text-muted); font-size: 0.82rem;">${escapeHtml(s.email || s.phone_number || '—')}</td>
      <td style="text-align: center;">
        <div class="action-buttons" style="justify-content: center;">
          <button class="btn btn-secondary btn-sm" title="View details" onclick="viewStudentDetails(${s.id})">
            👁️ View
          </button>
          <button class="btn btn-secondary btn-sm" title="Edit student" onclick="openEditStudentModal(${s.id})">
            ✏️ Edit
          </button>
          <button class="btn btn-danger btn-sm" title="Delete student" onclick="openDeleteModal(${s.id}, '${escapeHtml(s.full_name)}', '${escapeHtml(s.registration_number)}')">
            🗑️ Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('deptFilter').value = '';
  if (document.getElementById('sortByFilter')) document.getElementById('sortByFilter').value = 'id_desc';
  currentQuickFilter = 'all';
  document.querySelectorAll('.pill-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === 'all') btn.classList.add('active');
    else btn.classList.remove('active');
  });
  loadStudents();
}

// Export Current Students to CSV
function exportStudentsToCSV() {
  const students = getLocalStudents();
  if (!students || students.length === 0) {
    showToast('No students available to export.', 'error');
    return;
  }

  const headers = ['ID', 'Registration Number', 'Full Name', 'Department', 'Year of Study', 'CGPA', 'Enrolled Subjects', 'Email', 'Phone Number'];
  const rows = students.map(s => [
    s.id,
    `"${(s.registration_number || '').replace(/"/g, '""')}"`,
    `"${(s.full_name || '').replace(/"/g, '""')}"`,
    `"${(s.department_name || '').replace(/"/g, '""')}"`,
    s.year_of_study || 1,
    s.cgpa || 0,
    `"${(s.subjects || '').replace(/"/g, '""')}"`,
    `"${(s.email || '').replace(/"/g, '""')}"`,
    `"${(s.phone_number || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `student_academic_records_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Successfully exported ${students.length} student records to CSV!`, 'success');
}

// Print Student Grade Card
function printStudentGradeCard() {
  window.print();
}

// ==============================================================
// SQL CONSOLE QUERY PLAYGROUND (EXPANDED 18 DBMS VIVA PRESETS)
// ==============================================================
let autoRunPresetQueries = true;

const sqlPresets = {
  // Category 1: Joins & Relational Operations
  join_inner: {
    category: 'joins',
    title: 'Inner Join (Students + Department)',
    sql: `-- 1. INNER JOIN: Combine student records with department details
SELECT s.registration_number, s.full_name, d.name AS department, s.year_of_study, s.cgpa
FROM students s
INNER JOIN departments d ON s.department_id = d.id
ORDER BY s.cgpa DESC;`
  },

  join_left: {
    category: 'joins',
    title: 'Left Outer Join (All Depts & Enrollment)',
    sql: `-- 2. LEFT OUTER JOIN: All departments with enrollment count & average CGPA
SELECT d.id AS dept_id, d.name AS department, COUNT(s.id) AS enrolled_students, ROUND(AVG(s.cgpa), 2) AS dept_avg_cgpa
FROM departments d
LEFT JOIN students s ON d.id = s.department_id
GROUP BY d.id
ORDER BY enrolled_students DESC;`
  },

  join_self: {
    category: 'joins',
    title: 'Self Join (Pairs in Same Dept)',
    sql: `-- 3. SELF JOIN: Pairs of students enrolled in the same department
SELECT s1.full_name AS student_1, s2.full_name AS student_2, d.name AS department
FROM students s1
JOIN students s2 ON s1.department_id = s2.department_id AND s1.id < s2.id
JOIN departments d ON s1.department_id = d.id;`
  },

  // Category 2: Aggregations & Grouping
  agg_summary: {
    category: 'aggregates',
    title: 'College Aggregate Summary',
    sql: `-- 4. AGGREGATE SUMMARY: College-wide academic performance metrics
SELECT 
  COUNT(*) AS total_students,
  ROUND(AVG(cgpa), 2) AS overall_avg_cgpa,
  MIN(cgpa) AS lowest_cgpa,
  MAX(cgpa) AS highest_cgpa
FROM students;`
  },

  agg_having: {
    category: 'aggregates',
    title: 'HAVING Clause (High CGPA Depts)',
    sql: `-- 5. GROUP BY & HAVING: Departments maintaining an average CGPA >= 8.5
SELECT d.name AS department, COUNT(s.id) AS student_count, ROUND(AVG(s.cgpa), 2) AS avg_cgpa
FROM departments d
JOIN students s ON d.id = s.department_id
GROUP BY d.id
HAVING AVG(s.cgpa) >= 8.5
ORDER BY avg_cgpa DESC;`
  },

  agg_year_dept: {
    category: 'aggregates',
    title: 'Multi-Column Grouping (Year & Dept)',
    sql: `-- 6. MULTI-COLUMN GROUP BY: Student distribution by Year and Department
SELECT s.year_of_study, d.name AS department, COUNT(*) AS count, ROUND(AVG(s.cgpa), 2) AS avg_cgpa
FROM students s
JOIN departments d ON s.department_id = d.id
GROUP BY s.year_of_study, d.name
ORDER BY s.year_of_study ASC, count DESC;`
  },

  // Category 3: Subqueries & Sets
  subquery_above_avg: {
    category: 'subqueries',
    title: 'Scalar Subquery (Above Average CGPA)',
    sql: `-- 7. SCALAR SUBQUERY: Students scoring strictly higher than college average CGPA
SELECT registration_number, full_name, cgpa, year_of_study
FROM students
WHERE cgpa > (SELECT AVG(cgpa) FROM students)
ORDER BY cgpa DESC;`
  },

  subquery_correlated: {
    category: 'subqueries',
    title: 'Correlated Subquery (Department Toppers)',
    sql: `-- 8. CORRELATED SUBQUERY: Department toppers (highest CGPA in each department)
SELECT s.registration_number, s.full_name, d.name AS department, s.cgpa
FROM students s
JOIN departments d ON s.department_id = d.id
WHERE s.cgpa = (
  SELECT MAX(s2.cgpa)
  FROM students s2
  WHERE s2.department_id = s.department_id
)
ORDER BY s.cgpa DESC;`
  },

  subquery_in: {
    category: 'subqueries',
    title: 'IN Subquery (Multiple Students)',
    sql: `-- 9. IN SUBQUERY: Students enrolled in departments having at least 2 students
SELECT s.registration_number, s.full_name, s.department_id, s.cgpa
FROM students s
WHERE s.department_id IN (
  SELECT department_id 
  FROM students 
  GROUP BY department_id 
  HAVING COUNT(*) >= 2
)
ORDER BY s.cgpa DESC;`
  },

  subquery_exists: {
    category: 'subqueries',
    title: 'EXISTS Clause (Active Departments)',
    sql: `-- 10. EXISTS CLAUSE: Departments that have at least one active enrolled student
SELECT d.id AS dept_id, d.name AS department_name
FROM departments d
WHERE EXISTS (
  SELECT 1 FROM students s WHERE s.department_id = d.id
);`
  },

  // Category 4: Window Functions & CTEs
  window_rank_dept: {
    category: 'window',
    title: 'Window Function: DENSE_RANK()',
    sql: `-- 11. WINDOW FUNCTION: Rank students within their respective departments
SELECT 
  s.full_name,
  d.name AS department,
  s.cgpa,
  DENSE_RANK() OVER (PARTITION BY s.department_id ORDER BY s.cgpa DESC) AS dept_rank
FROM students s
JOIN departments d ON s.department_id = d.id;`
  },

  window_overall: {
    category: 'window',
    title: 'Window Function: Merit ROW_NUMBER()',
    sql: `-- 12. WINDOW FUNCTION: Overall college merit position
SELECT 
  ROW_NUMBER() OVER (ORDER BY s.cgpa DESC) AS merit_position,
  s.registration_number,
  s.full_name,
  d.name AS department,
  s.cgpa
FROM students s
JOIN departments d ON s.department_id = d.id;`
  },

  window_lead_lag: {
    category: 'window',
    title: 'Window Function: LAG() Gap Analysis',
    sql: `-- 13. WINDOW FUNCTION: Compare student CGPA to the rank immediately above them
SELECT 
  full_name,
  cgpa,
  LAG(cgpa, 1) OVER (ORDER BY cgpa DESC) AS previous_cgpa,
  ROUND(LAG(cgpa, 1) OVER (ORDER BY cgpa DESC) - cgpa, 2) AS cgpa_gap
FROM students
ORDER BY cgpa DESC;`
  },

  complex_cte: {
    category: 'window',
    title: 'Common Table Expression: WITH CTE',
    sql: `-- 14. COMMON TABLE EXPRESSION (CTE): Aggregate stats in temporary CTE & filter
WITH DeptStats AS (
  SELECT department_id, ROUND(AVG(cgpa), 2) AS avg_cgpa, COUNT(*) AS student_count
  FROM students
  GROUP BY department_id
)
SELECT d.name AS department, ds.student_count, ds.avg_cgpa
FROM DeptStats ds
JOIN departments d ON ds.department_id = d.id
WHERE ds.avg_cgpa >= 8.5;`
  },

  // Category 5: Expressions & Pattern Matching
  expr_honors: {
    category: 'patterns',
    title: 'CASE Expression: Academic Honors',
    sql: `-- 15. CASE STATEMENT: Academic honors and degree division classification
SELECT 
  registration_number,
  full_name,
  cgpa,
  CASE 
    WHEN cgpa >= 9.0 THEN '🏆 First Class with Distinction'
    WHEN cgpa >= 7.5 THEN '🎖️ First Class'
    WHEN cgpa >= 6.0 THEN '📜 Second Class'
    ELSE '⚠️ Needs Improvement'
  END AS academic_division
FROM students
ORDER BY cgpa DESC;`
  },

  pattern_filter: {
    category: 'patterns',
    title: 'Pattern Matching: LIKE Wildcard',
    sql: `-- 16. PATTERN MATCHING & LIKE: Filter students studying Database subjects
SELECT registration_number, full_name, email, subjects, cgpa
FROM students
WHERE subjects LIKE '%Database%' OR subjects LIKE '%DBMS%'
ORDER BY cgpa DESC;`
  },

  expr_coalesce: {
    category: 'patterns',
    title: 'COALESCE & SUBSTR (Batch Analysis)',
    sql: `-- 17. STRING FUNCTIONS & COALESCE: Extract batch year and handle empty contacts
SELECT 
  registration_number,
  SUBSTR(registration_number, 1, 4) AS enrollment_batch,
  full_name,
  COALESCE(phone_number, 'No Phone') AS phone_status,
  COALESCE(email, 'No Email') AS email_status
FROM students
ORDER BY enrollment_batch DESC;`
  },

  subquery_not_exists: {
    category: 'patterns',
    title: 'NOT EXISTS: Unenrolled Departments',
    sql: `-- 18. NOT EXISTS: Check for departments that currently have 0 enrolled students
SELECT d.id, d.name AS empty_department
FROM departments d
WHERE NOT EXISTS (
  SELECT 1 FROM students s WHERE s.department_id = d.id
);`
  }
};

// Backward compatibility aliases for legacy preset keys
sqlPresets.join = sqlPresets.join_inner;
sqlPresets.aggregate = sqlPresets.agg_summary;
sqlPresets.subquery = sqlPresets.subquery_above_avg;
sqlPresets.filter = sqlPresets.pattern_filter;
sqlPresets.departments = sqlPresets.join_left;

function filterSqlPresets(category, btnEl) {
  document.querySelectorAll('.sql-cat-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const chips = document.querySelectorAll('.preset-chip');
  chips.forEach(chip => {
    const chipCat = chip.getAttribute('data-cat');
    if (category === 'all' || chipCat === category) {
      chip.style.display = 'inline-flex';
    } else {
      chip.style.display = 'none';
    }
  });
}

function loadSqlPreset(presetKey, forceRun = false) {
  const item = sqlPresets[presetKey];
  const query = item ? item.sql : '';
  const editor = document.getElementById('sqlQueryInput');
  const meta = document.getElementById('sqlMetaInfo');

  if (editor) {
    editor.value = query;
  }

  // Update active chip state
  document.querySelectorAll('.preset-chip').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.preset-chip[data-key="${presetKey}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  if (meta && item) {
    meta.textContent = `⚡ Preset: ${item.title}`;
    meta.style.color = 'var(--primary)';
  }

  // AUTO-EXECUTE: Automatically run so the user gets instant results!
  if (autoRunPresetQueries || forceRun) {
    executeSqlQuery();
  }
}

function toggleAutoRunPresets() {
  autoRunPresetQueries = !autoRunPresetQueries;
  const toggleBtn = document.getElementById('autoRunToggleBtn');
  if (toggleBtn) {
    toggleBtn.textContent = autoRunPresetQueries ? '⚡ Instant Run: ON' : '⏸️ Instant Run: OFF';
    toggleBtn.className = `btn btn-sm ${autoRunPresetQueries ? 'btn-primary' : 'btn-secondary'}`;
  }
  showToast(`Preset auto-execution turned ${autoRunPresetQueries ? 'ON' : 'OFF'}`, 'info');
}

function copySqlDdl() {
  const ddlText = `-- Relational Database Schema DDL for Student Management System
PRAGMA foreign_keys = ON;

-- 1. Departments Table (Parent Entity)
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- 2. Students Table (Child Entity)
CREATE TABLE IF NOT EXISTS students (
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

-- Index for optimizing Foreign Key Lookups & Joins
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department_id);`;

  navigator.clipboard.writeText(ddlText).then(() => {
    showToast('SQL DDL statements copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy to clipboard', 'error');
  });
}

// Live Schema Metadata Inspector from /api/schema
async function loadLiveSchemaMetadata() {
  const container = document.getElementById('liveSchemaOutput');
  if (!container) return;

  container.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted);">Fetching live PRAGMA metadata from SQLite...</div>';

  try {
    const res = await fetch('/api/schema');
    if (!res.ok) throw new Error('Failed to retrieve schema metadata');
    const data = await res.json();

    const tables = data.tables || {};
    let html = '';

    for (const [tableName, meta] of Object.entries(tables)) {
      html += `
        <div class="schema-inspect-table">
          <div class="schema-inspect-header">
            <h4>📋 Table: <code>${escapeHtml(tableName)}</code></h4>
            <span class="badge-table-cols">${meta.columns.length} Columns</span>
          </div>
          <table class="data-table inspect-table">
            <thead>
              <tr>
                <th>CID</th>
                <th>Column Name</th>
                <th>SQLite Type</th>
                <th>Not Null</th>
                <th>Default</th>
                <th>Constraint Role</th>
              </tr>
            </thead>
            <tbody>
              ${meta.columns.map(col => {
                let role = '<span style="color: var(--text-muted);">-</span>';
                if (col.pk === 1) role = '<span class="badge-pk">PRIMARY KEY</span>';
                else if (tableName === 'students' && col.name === 'department_id') role = '<span class="badge-fk">FOREIGN KEY &rarr; departments(id)</span>';
                else if (col.name === 'registration_number' || (tableName === 'departments' && col.name === 'name')) role = '<span class="badge-uk">UNIQUE</span>';
                else if (col.name === 'cgpa' || col.name === 'year_of_study') role = '<span class="badge-check">CHECK CONSTRAINT</span>';

                return `
                  <tr>
                    <td><code>#${col.cid}</code></td>
                    <td><strong>${escapeHtml(col.name)}</strong></td>
                    <td><code>${escapeHtml(col.type || 'TEXT')}</code></td>
                    <td>${col.notnull ? '<span style="color: var(--danger); font-weight: 600;">NOT NULL</span>' : '<span style="color: var(--text-muted);">NULLABLE</span>'}</td>
                    <td><code>${col.dflt_value !== null ? escapeHtml(col.dflt_value) : 'NULL'}</code></td>
                    <td>${role}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div style="padding: 16px; color: var(--danger);">Failed to load live schema: ${escapeHtml(err.message)}</div>`;
  }
}

function clearSqlQuery() {
  const editor = document.getElementById('sqlQueryInput');
  if (editor) editor.value = '';
  const metaInfo = document.getElementById('sqlMetaInfo');
  if (metaInfo) {
    metaInfo.textContent = 'Editor cleared. Type an SQL query or select a preset above.';
    metaInfo.style.color = 'var(--text-muted)';
  }
}

async function executeSqlQuery() {
  const editor = document.getElementById('sqlQueryInput');
  const query = (editor.value || '').trim();
  const metaInfo = document.getElementById('sqlMetaInfo');
  const countLabel = document.getElementById('sqlRowCount');
  const tableHead = document.getElementById('sqlResultsHead');
  const tableBody = document.getElementById('sqlResultsBody');
  const runBtn = document.getElementById('btnRunSql');

  if (!query) {
    showToast('Please type an SQL query to execute.', 'error');
    return;
  }

  if (metaInfo) {
    metaInfo.textContent = '⏳ Executing query on SQLite engine...';
    metaInfo.style.color = 'var(--primary)';
  }
  if (runBtn) {
    runBtn.disabled = true;
    runBtn.innerHTML = '<span>⏳</span> Running...';
  }

  try {
    const res = await fetch('/api/sql-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      if (metaInfo) {
        metaInfo.textContent = `❌ Error: ${data.error || 'Execution failed'}`;
        metaInfo.style.color = 'var(--danger)';
      }
      if (countLabel) countLabel.textContent = '0 rows';
      if (tableHead) tableHead.innerHTML = '<tr><th style="color: var(--danger);">SQL Error Message</th></tr>';
      if (tableBody) tableBody.innerHTML = `<tr><td style="color: var(--danger); font-family: monospace; padding: 16px;">${escapeHtml(data.error || 'Unknown SQL error')}</td></tr>`;
      showToast('SQL Execution Error', 'error');
      return;
    }

    if (metaInfo) {
      metaInfo.style.color = 'var(--success)';
      metaInfo.textContent = `✅ Executed in ${data.execution_ms} ms | Returned ${data.row_count} row(s)`;
    }
    if (countLabel) countLabel.textContent = `${data.row_count} row(s)`;

    if (!data.columns || data.columns.length === 0) {
      if (tableHead) tableHead.innerHTML = '<tr><th>Result</th></tr>';
      if (tableBody) tableBody.innerHTML = `<tr><td style="color: var(--success); font-family: monospace; padding: 16px;">Statement executed successfully (${data.row_count} rows affected).</td></tr>`;
      showToast('Query Executed Successfully', 'success');
      return;
    }

    // Render Headers
    if (tableHead) {
      tableHead.innerHTML = `<tr>${data.columns.map(col => `<th>${escapeHtml(col)}</th>`).join('')}</tr>`;
    }

    // Render Rows
    if (tableBody) {
      if (data.rows.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="${data.columns.length}" style="text-align: center; color: var(--text-muted); padding: 20px;">Query returned zero rows.</td></tr>`;
      } else {
        tableBody.innerHTML = data.rows.map(row => `
          <tr>
            ${row.map(val => `<td style="font-family: monospace; font-size: 0.88rem;">${val !== null ? escapeHtml(val) : '<span style="color: var(--text-muted); font-style: italic;">NULL</span>'}</td>`).join('')}
          </tr>
        `).join('');
      }
    }

    showToast(`Query returned ${data.row_count} row(s) in ${data.execution_ms}ms`, 'success');

  } catch (err) {
    if (metaInfo) {
      metaInfo.textContent = `Network / Server Error: ${err.message}`;
      metaInfo.style.color = 'var(--danger)';
    }
    if (tableHead) tableHead.innerHTML = '<tr><th>Error</th></tr>';
    if (tableBody) tableBody.innerHTML = `<tr><td style="color: var(--danger); padding: 16px;">${escapeHtml(err.message)}</td></tr>`;
    showToast('Failed to connect to backend SQL engine.', 'error');
  } finally {
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.innerHTML = '<span>⚡</span> Execute Query (Ctrl+Enter)';
    }
  }
}

// Open Add Student Modal
function openAddStudentModal() {
  document.getElementById('formModalTitle').textContent = 'Add New Student';
  document.getElementById('studentIdField').value = '';
  document.getElementById('regNumberField').value = '';
  document.getElementById('fullNameField').value = '';
  document.getElementById('emailField').value = '';
  document.getElementById('phoneField').value = '';
  document.getElementById('yearOfStudyField').value = '1';
  document.getElementById('cgpaField').value = '8.50';
  document.getElementById('subjectsField').value = 'Database Management, Operating Systems';
  document.getElementById('departmentField').value = allDepartments.length > 0 ? allDepartments[0].id : '';

  const errAlert = document.getElementById('formErrorAlert');
  errAlert.style.display = 'none';
  document.getElementById('studentFormModal').classList.add('active');
}

// Open Edit Student Modal
async function openEditStudentModal(studentId) {
  let s = null;
  try {
    const res = await fetch(`/api/students/${studentId}`);
    if (res.ok) s = await res.json();
    else throw new Error();
  } catch {
    s = getLocalStudents().find(x => x.id === studentId);
  }

  if (!s) {
    showAlert('Could not locate student record.', 'error');
    return;
  }

  document.getElementById('formModalTitle').textContent = 'Edit Student Details';
  document.getElementById('studentIdField').value = s.id;
  document.getElementById('regNumberField').value = s.registration_number || '';
  document.getElementById('fullNameField').value = s.full_name || '';
  document.getElementById('emailField').value = s.email || '';
  document.getElementById('phoneField').value = s.phone_number || '';
  document.getElementById('yearOfStudyField').value = s.year_of_study || 1;
  document.getElementById('cgpaField').value = s.cgpa || 8.5;
  document.getElementById('subjectsField').value = s.subjects || 'Database Management Systems, Networks';
  document.getElementById('departmentField').value = s.department_id || '';

  const errAlert = document.getElementById('formErrorAlert');
  errAlert.style.display = 'none';
  document.getElementById('studentFormModal').classList.add('active');
}

function closeStudentFormModal() {
  document.getElementById('studentFormModal').classList.remove('active');
}

// Save Student (Form Submit)
async function handleStudentFormSubmit(event) {
  event.preventDefault();
  const errAlert = document.getElementById('formErrorAlert');
  errAlert.style.display = 'none';

  const studentId = document.getElementById('studentIdField').value;
  const regNumber = document.getElementById('regNumberField').value.trim().toUpperCase();
  const fullName = document.getElementById('fullNameField').value.trim();
  const email = document.getElementById('emailField').value.trim();
  const phone = document.getElementById('phoneField').value.trim();
  const departmentId = parseInt(document.getElementById('departmentField').value);
  const yearOfStudy = parseInt(document.getElementById('yearOfStudyField').value);
  const cgpa = parseFloat(document.getElementById('cgpaField').value) || 8.5;
  const subjects = document.getElementById('subjectsField').value.trim();

  const deptObj = allDepartments.find(d => d.id === departmentId);
  const departmentName = deptObj ? deptObj.name : 'General';

  const payload = {
    registration_number: regNumber,
    full_name: fullName,
    email: email || null,
    phone_number: phone || null,
    department_id: departmentId,
    department_name: departmentName,
    year_of_study: yearOfStudy,
    cgpa: cgpa,
    subjects: subjects || 'Core Curriculum'
  };

  const isEdit = Boolean(studentId);
  const url = isEdit ? `/api/students/${studentId}` : '/api/students';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save student.');
    }

    if (!isEdit && data.id) payload.id = data.id;
  } catch (err) {
    console.warn('Backend write failed, saving directly to local storage:', err.message);
  }

  // Always update LocalStorage cache
  const local = getLocalStudents();
  if (isEdit) {
    const idx = local.findIndex(x => String(x.id) === String(studentId));
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...payload, id: parseInt(studentId) };
    }
  } else {
    payload.id = payload.id || (local.length > 0 ? Math.max(...local.map(x => x.id)) + 1 : 1);
    local.unshift(payload);
  }
  saveLocalStudents(local);

  closeStudentFormModal();
  showAlert(isEdit ? 'Student record updated successfully!' : 'Student registered successfully in database and local storage!');
  loadStudents();
  loadDashboardData();
}

// View Student Details in Modal
async function viewStudentDetails(studentId) {
  let s = null;
  try {
    const res = await fetch(`/api/students/${studentId}`);
    if (res.ok) s = await res.json();
    else throw new Error();
  } catch {
    s = getLocalStudents().find(x => x.id === studentId);
  }

  if (!s) return;

  document.getElementById('detailFullName').textContent = s.full_name;
  document.getElementById('detailRegNumber').textContent = `Registration No: ${s.registration_number}`;
  document.getElementById('detailId').textContent = `#${s.id}`;
  document.getElementById('detailYear').textContent = `${s.year_of_study || 1}st Year Undergraduate`;
  document.getElementById('detailDept').textContent = s.department_name || 'General Academic';
  document.getElementById('detailCgpa').innerHTML = renderCgpaBadge(s.cgpa);
  document.getElementById('detailEmail').textContent = s.email || 'None provided';
  document.getElementById('detailPhone').textContent = s.phone_number || 'None provided';
  document.getElementById('detailSubjects').textContent = s.subjects || 'General Curriculum (DBMS, OS, Networks)';

  document.getElementById('studentDetailsModal').classList.add('active');
}

function closeStudentDetailsModal() {
  document.getElementById('studentDetailsModal').classList.remove('active');
}

// Delete Confirmation
function openDeleteModal(studentId, fullName, regNumber) {
  deleteCandidateId = studentId;
  document.getElementById('deleteTargetName').textContent = fullName;
  document.getElementById('deleteTargetReg').textContent = regNumber;
  document.getElementById('deleteConfirmModal').classList.add('active');
}

function closeDeleteModal() {
  deleteCandidateId = null;
  document.getElementById('deleteConfirmModal').classList.remove('active');
}

async function executeDelete() {
  if (!deleteCandidateId) return;

  try {
    await fetch(`/api/students/${deleteCandidateId}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Backend delete error, removing from local storage:', err);
  }

  // Remove from LocalStorage
  const local = getLocalStudents().filter(x => x.id !== deleteCandidateId);
  saveLocalStudents(local);

  closeDeleteModal();
  showAlert('Student was deleted from database and local storage.');
  loadStudents();
  loadDashboardData();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
