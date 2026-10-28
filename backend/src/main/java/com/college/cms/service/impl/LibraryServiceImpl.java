package com.college.cms.service.impl;

import com.college.cms.dto.LibraryBookDto;
import com.college.cms.dto.LibraryIssueDto;
import com.college.cms.entity.LibraryBook;
import com.college.cms.entity.LibraryIssue;
import com.college.cms.entity.Student;
import com.college.cms.exception.ApiException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.LibraryBookRepository;
import com.college.cms.repository.LibraryIssueRepository;
import com.college.cms.repository.StudentRepository;
import com.college.cms.service.LibraryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LibraryServiceImpl implements LibraryService {

    private final LibraryBookRepository bookRepository;
    private final LibraryIssueRepository issueRepository;
    private final StudentRepository studentRepository;

    public LibraryServiceImpl(LibraryBookRepository bookRepository,
                              LibraryIssueRepository issueRepository,
                              StudentRepository studentRepository) {
        this.bookRepository = bookRepository;
        this.issueRepository = issueRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional
    public LibraryBookDto addBook(LibraryBookDto dto) {
        if (bookRepository.existsByIsbn(dto.getIsbn())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Book with ISBN already exists.");
        }
        LibraryBook book = LibraryBook.builder()
                .title(dto.getTitle())
                .author(dto.getAuthor())
                .isbn(dto.getIsbn())
                .publisher(dto.getPublisher())
                .totalCopies(dto.getTotalCopies())
                .availableCopies(dto.getTotalCopies())
                .category(dto.getCategory())
                .build();
        LibraryBook saved = bookRepository.save(book);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void deleteBook(Long id) {
        LibraryBook book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        bookRepository.delete(book);
    }

    @Override
    @Transactional
    public LibraryIssueDto issueBook(String rollNumber, String isbn) {
        Student student = studentRepository.findAll().stream()
                .filter(s -> s.getRollNumber().equalsIgnoreCase(rollNumber))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found with Roll Number: " + rollNumber));

        LibraryBook book = bookRepository.findByIsbn(isbn)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Book not found with ISBN: " + isbn));

        if (book.getAvailableCopies() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No copies of this book are currently available.");
        }

        // Check if student already has this book issued active
        Optional<LibraryIssue> active = issueRepository.findByStudentIdAndBookIdAndStatus(student.getId(), book.getId(), "ISSUED");
        if (active.isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This student has already checked out a copy of this book.");
        }

        LibraryIssue issue = LibraryIssue.builder()
                .student(student)
                .book(book)
                .dueDate(LocalDate.now().plusDays(14)) // standard 14 days issue
                .status("ISSUED")
                .build();

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        LibraryIssue saved = issueRepository.save(issue);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public LibraryIssueDto returnBook(String rollNumber, String isbn) {
        Student student = studentRepository.findAll().stream()
                .filter(s -> s.getRollNumber().equalsIgnoreCase(rollNumber))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found with Roll Number: " + rollNumber));

        LibraryBook book = bookRepository.findByIsbn(isbn)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Book not found with ISBN: " + isbn));

        LibraryIssue issue = issueRepository.findByStudentIdAndBookIdAndStatus(student.getId(), book.getId(), "ISSUED")
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No active issue log found for this book and student."));

        issue.setReturnDate(LocalDate.now());
        issue.setStatus("RETURNED");

        // Calculate fine (₹5 per day overdue)
        long daysOverdue = ChronoUnit.DAYS.between(issue.getDueDate(), LocalDate.now());
        if (daysOverdue > 0) {
            issue.setFineAmount(daysOverdue * 5.0);
        } else {
            issue.setFineAmount(0.0);
        }

        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        LibraryIssue saved = issueRepository.save(issue);
        return mapToDto(saved);
    }

    @Override
    public Page<LibraryBookDto> searchBooks(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LibraryBook> books;
        if (query == null || query.trim().isEmpty()) {
            books = bookRepository.findAll(pageable);
        } else {
            books = bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(query, query, pageable);
        }
        return books.map(this::mapToDto);
    }

    @Override
    public List<LibraryIssueDto> getIssuesForStudent(Long studentId) {
        return issueRepository.findByStudentId(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<LibraryIssueDto> getAllIssues() {
        return issueRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private LibraryBookDto mapToDto(LibraryBook book) {
        return LibraryBookDto.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .publisher(book.getPublisher())
                .totalCopies(book.getTotalCopies())
                .availableCopies(book.getAvailableCopies())
                .category(book.getCategory())
                .build();
    }

    private LibraryIssueDto mapToDto(LibraryIssue issue) {
        return LibraryIssueDto.builder()
                .id(issue.getId())
                .studentId(issue.getStudent().getId())
                .studentRollNumber(issue.getStudent().getRollNumber())
                .studentName(issue.getStudent().getFirstName() + " " + issue.getStudent().getLastName())
                .bookId(issue.getBook().getId())
                .bookTitle(issue.getBook().getTitle())
                .bookIsbn(issue.getBook().getIsbn())
                .issueDate(issue.getIssueDate())
                .dueDate(issue.getDueDate())
                .returnDate(issue.getReturnDate())
                .fineAmount(issue.getFineAmount())
                .status(issue.getStatus())
                .build();
    }
}
