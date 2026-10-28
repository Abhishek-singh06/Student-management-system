import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';

const AdminFacilities = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Hostel Allocations, 1: Library issues, 2: Book Catalog

  // Shared state
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hostels State
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [students, setStudents] = useState([]);
  const [allocations, setAllocations] = useState([]);
  
  // Allocate Form
  const [studentRoll, setStudentRoll] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  // Library State
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  
  // Book Form
  const [openBookDialog, setOpenBookDialog] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookIsbn, setBookIsbn] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookCopies, setBookCopies] = useState(1);
  const [bookCategory, setBookCategory] = useState('');

  // Issue/Return Forms
  const [libRoll, setLibRoll] = useState('');
  const [libIsbn, setLibIsbn] = useState('');

  useEffect(() => {
    fetchHostelData();
    fetchLibraryData();
  }, []);

  const fetchHostelData = async () => {
    try {
      const hostelRes = await api.get('/hostels');
      setHostels(hostelRes.data);
      
      const studentsRes = await api.get('/students', { params: { pageSize: 100 } });
      setStudents(studentsRes.data.content);
    } catch (err) {
      console.error('Failed to load hostel configuration options.');
    }
  };

  const fetchLibraryData = async () => {
    try {
      const booksRes = await api.get('/library/books', { params: { pageSize: 100 } });
      setBooks(booksRes.data.content);

      const issuesRes = await api.get('/library/issues');
      setIssues(issuesRes.data);
    } catch (err) {
      console.error('Failed to load library catalog or issue list.');
    }
  };

  // Load rooms when hostel selected
  useEffect(() => {
    if (selectedHostel) {
      api.get(`/hostels/${selectedHostel}/rooms`)
        .then(res => setRooms(res.data))
        .catch(err => console.error(err));
    } else {
      setRooms([]);
    }
  }, [selectedHostel]);

  const handleAllocate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const matchedStudent = students.find(s => s.rollNumber.equalsIgnoreCase(studentRoll.trim()));
    if (!matchedStudent) {
      setError('Student not found with matching roll number.');
      return;
    }

    try {
      await api.post(`/hostels/allocate/student/${matchedStudent.id}/room/${selectedRoom}`);
      setSuccess('Room allocated to student successfully!');
      setStudentRoll('');
      setSelectedRoom('');
      setSelectedHostel('');
      fetchHostelData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Allocation failed.');
    }
  };

  const handleVacate = async (studentId) => {
    if (!window.confirm('Are you sure you want to vacate this room allocation?')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await api.post(`/hostels/vacate/student/${studentId}`);
      setSuccess('Student checked out of hostel room.');
      fetchHostelData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Vacation failed.');
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!bookTitle || !bookAuthor || !bookIsbn) {
      alert('Please fill in required book details.');
      return;
    }

    try {
      const payload = {
        title: bookTitle,
        author: bookAuthor,
        isbn: bookIsbn,
        publisher: bookPublisher,
        totalCopies: parseInt(bookCopies),
        category: bookCategory
      };

      await api.post('/library/books', payload);
      setSuccess('Book cataloged successfully!');
      setOpenBookDialog(false);
      fetchLibraryData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add book.');
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post(`/library/issue`, null, {
        params: { rollNumber: libRoll.trim(), isbn: libIsbn.trim() }
      });
      setSuccess('Book issued to student successfully!');
      setLibRoll('');
      setLibIsbn('');
      fetchLibraryData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue book.');
    }
  };

  const handleReturnBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/library/return`, null, {
        params: { rollNumber: libRoll.trim(), isbn: libIsbn.trim() }
      });
      const fine = res.data.fineAmount;
      setSuccess(`Book returned successfully! ${fine > 0 ? `Fine assessed: ₹${fine}` : 'No fine due.'}`);
      setLibRoll('');
      setLibIsbn('');
      fetchLibraryData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return book.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
          Facility Management (Hostel & Library)
        </Typography>
        {activeTab === 2 && (
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => {
              setBookTitle('');
              setBookAuthor('');
              setBookIsbn('');
              setBookPublisher('');
              setBookCopies(1);
              setBookCategory('');
              setOpenBookDialog(true);
            }}
            sx={{ textTransform: 'none', borderRadius: '8px' }}
          >
            Catalog New Book
          </Button>
        )}
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      <Paper sx={{ backgroundColor: 'rgba(17, 24, 39, 0.4)', borderRadius: '12px', mb: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            '& .MuiTab-root': { color: '#9ca3af', fontWeight: 600 },
            '& .Mui-selected': { color: '#10b981' },
            '& .MuiTabs-indicator': { backgroundColor: '#10b981' }
          }}
        >
          <Tab label="Hostel Bookings" icon={<HomeIcon />} iconPosition="start" />
          <Tab label="Book Checkouts" icon={<LocalLibraryIcon />} iconPosition="start" />
          <Tab label="Library Catalog" icon={<LocalLibraryIcon />} iconPosition="start" />
        </Tabs>

        {/* Tab 0: Hostel Allocations */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card className="glass-panel" sx={{ backgroundColor: 'rgba(17, 24, 39, 0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>Allocate Room</Typography>
                    <form onSubmit={handleAllocate}>
                      <TextField
                        label="Student Roll Number"
                        variant="outlined"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={studentRoll}
                        onChange={(e) => setStudentRoll(e.target.value)}
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ style: { color: '#ffffff' } }}
                        sx={{ mb: 2 }}
                      />

                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel sx={{ color: '#9ca3af' }}>Select Hostel building</InputLabel>
                        <Select
                          value={selectedHostel}
                          label="Select Hostel building"
                          onChange={(e) => setSelectedHostel(e.target.value)}
                          sx={{ color: '#ffffff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}
                        >
                          {hostels.map((h) => (
                            <MenuItem key={h.id} value={h.id}>
                              {h.name} ({h.type})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small" sx={{ mb: 2 }} disabled={!selectedHostel}>
                        <InputLabel sx={{ color: '#9ca3af' }}>Select Room</InputLabel>
                        <Select
                          value={selectedRoom}
                          label="Select Room"
                          onChange={(e) => setSelectedRoom(e.target.value)}
                          sx={{ color: '#ffffff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}
                        >
                          {rooms.map((r) => (
                            <MenuItem key={r.id} value={r.id} disabled={r.occupancy >= r.capacity}>
                              Room {r.roomNumber} ({r.occupancy}/{r.capacity} Occupied) - ₹{r.rentPerSemester}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        startIcon={<SaveIcon />}
                        fullWidth
                        sx={{ textTransform: 'none', borderRadius: '6px' }}
                      >
                        Allocate Room
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>Active Allocations</Typography>
                <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', color: '#ffffff' }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Roll Number</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Student Name</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Hostel</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Room</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Allocated Date</TableCell>
                        <TableCell align="right" sx={{ color: '#9ca3af', fontWeight: 600 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.filter(s => s.hostelRoomNumber).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ color: '#9ca3af', py: 4 }}>
                            No active rooms allocated yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        students.filter(s => s.hostelRoomNumber).map((student) => (
                          <TableRow key={student.id}>
                            <TableCell sx={{ color: '#ffffff', fontWeight: 700 }}>{student.rollNumber}</TableCell>
                            <TableCell sx={{ color: '#d1d5db' }}>{student.firstName} {student.lastName}</TableCell>
                            <TableCell sx={{ color: '#d1d5db' }}>{student.hostelName || 'Hostel A'}</TableCell>
                            <TableCell sx={{ color: '#d1d5db' }}>{student.hostelRoomNumber}</TableCell>
                            <TableCell sx={{ color: '#9ca3af' }}>{student.hostelAllocationDate || '2026-07-25'}</TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={() => handleVacate(student.id)}
                                sx={{ textTransform: 'none', py: 0 }}
                              >
                                Vacate
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 1: Book Checkouts */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card className="glass-panel" sx={{ backgroundColor: 'rgba(17, 24, 39, 0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>Issue / Return book</Typography>
                    <form>
                      <TextField
                        label="Student Roll Number"
                        variant="outlined"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={libRoll}
                        onChange={(e) => setLibRoll(e.target.value)}
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ style: { color: '#ffffff' } }}
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        label="Book ISBN"
                        variant="outlined"
                        fullWidth
                        size="small"
                        margin="dense"
                        value={libIsbn}
                        onChange={(e) => setLibIsbn(e.target.value)}
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ style: { color: '#ffffff' } }}
                        sx={{ mb: 3 }}
                      />

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleIssueBook}
                            fullWidth
                            sx={{ textTransform: 'none', borderRadius: '6px', backgroundColor: '#3b82f6', '&:hover': { backgroundColor: '#2563eb' } }}
                          >
                            Issue Book
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={handleReturnBook}
                            fullWidth
                            sx={{ textTransform: 'none', borderRadius: '6px' }}
                          >
                            Return Book
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>Checkout History</Typography>
                <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', color: '#ffffff' }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Roll Number</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Student Name</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Book Title</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Issue Date</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Due Date</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Return Date</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {issues.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ color: '#9ca3af', py: 4 }}>
                            No book checkout issues logged yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        issues.map((issue) => (
                          <TableRow key={issue.id}>
                            <TableCell sx={{ color: '#ffffff', fontWeight: 700 }}>{issue.studentRollNumber}</TableCell>
                            <TableCell sx={{ color: '#d1d5db' }}>{issue.studentName}</TableCell>
                            <TableCell sx={{ color: '#d1d5db' }}>{issue.bookTitle}</TableCell>
                            <TableCell sx={{ color: '#9ca3af' }}>{issue.issueDate}</TableCell>
                            <TableCell sx={{ color: '#9ca3af' }}>{issue.dueDate}</TableCell>
                            <TableCell sx={{ color: '#9ca3af' }}>{issue.returnDate || '—'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={issue.status} 
                                color={issue.status === 'RETURNED' ? 'success' : (issue.fineAmount > 0 ? 'error' : 'primary')} 
                                size="small" 
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 2: Library Catalog */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', color: '#ffffff' }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>ISBN</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Author</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Publisher</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Available Copies</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {books.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: '#9ca3af', py: 4 }}>
                        No books cataloged in the library yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 700 }}>{book.isbn}</TableCell>
                        <TableCell sx={{ color: '#d1d5db' }}>{book.title}</TableCell>
                        <TableCell sx={{ color: '#d1d5db' }}>{book.author}</TableCell>
                        <TableCell sx={{ color: '#9ca3af' }}>{book.publisher || '—'}</TableCell>
                        <TableCell sx={{ color: '#9ca3af' }}>{book.category || 'General'}</TableCell>
                        <TableCell sx={{ color: '#10b981', fontWeight: 700 }}>
                          {book.availableCopies} / {book.totalCopies}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Catalog Book Dialog */}
      <Dialog
        open={openBookDialog}
        onClose={() => setOpenBookDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#111827',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            minWidth: '450px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          Catalog Library Book
        </DialogTitle>
        <form onSubmit={handleAddBook}>
          <DialogContent sx={{ py: 3 }}>
            <TextField
              label="Book Title *"
              variant="outlined"
              fullWidth
              margin="dense"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
            <TextField
              label="Book Author *"
              variant="outlined"
              fullWidth
              margin="dense"
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
            <TextField
              label="ISBN Number *"
              variant="outlined"
              fullWidth
              margin="dense"
              value={bookIsbn}
              onChange={(e) => setBookIsbn(e.target.value)}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
            <TextField
              label="Publisher"
              variant="outlined"
              fullWidth
              margin="dense"
              value={bookPublisher}
              onChange={(e) => setBookPublisher(e.target.value)}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
            <TextField
              label="Total Copies"
              type="number"
              variant="outlined"
              fullWidth
              margin="dense"
              value={bookCopies}
              onChange={(e) => setBookCopies(e.target.value)}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
            <TextField
              label="Category (e.g. Database Systems)"
              variant="outlined"
              fullWidth
              margin="dense"
              value={bookCategory}
              onChange={(e) => setBookCategory(e.target.value)}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Button onClick={() => setOpenBookDialog(false)} sx={{ color: '#9ca3af', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="success"
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Add Book
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminFacilities;
