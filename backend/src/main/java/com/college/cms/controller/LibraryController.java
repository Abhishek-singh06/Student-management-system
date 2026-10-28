package com.college.cms.controller;

import com.college.cms.dto.LibraryBookDto;
import com.college.cms.dto.LibraryIssueDto;
import com.college.cms.service.LibraryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final LibraryService libraryService;

    public LibraryController(LibraryService libraryService) {
        this.libraryService = libraryService;
    }

    // Add a book to the catalog (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/books")
    public ResponseEntity<LibraryBookDto> addBook(@Valid @RequestBody LibraryBookDto bookDto) {
        LibraryBookDto saved = libraryService.addBook(bookDto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Delete a book from the catalog (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/books/{id}")
    public ResponseEntity<String> deleteBook(@PathVariable("id") Long id) {
        libraryService.deleteBook(id);
        return ResponseEntity.ok("Book deleted successfully from catalog.");
    }

    // Checkout/Issue a book to a student (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/issue")
    public ResponseEntity<LibraryIssueDto> issueBook(
            @RequestParam("rollNumber") String rollNumber,
            @RequestParam("isbn") String isbn
    ) {
        LibraryIssueDto issue = libraryService.issueBook(rollNumber, isbn);
        return ResponseEntity.ok(issue);
    }

    // Return an issued book (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/return")
    public ResponseEntity<LibraryIssueDto> returnBook(
            @RequestParam("rollNumber") String rollNumber,
            @RequestParam("isbn") String isbn
    ) {
        LibraryIssueDto record = libraryService.returnBook(rollNumber, isbn);
        return ResponseEntity.ok(record);
    }

    // Browse/Search library books catalog
    @GetMapping("/books")
    public ResponseEntity<Page<LibraryBookDto>> searchBooks(
            @RequestParam(value = "query", required = false, defaultValue = "") String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<LibraryBookDto> books = libraryService.searchBooks(query, page, size);
        return ResponseEntity.ok(books);
    }

    // View active and historical book checkout logs for a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<LibraryIssueDto>> getStudentIssues(@PathVariable("studentId") Long studentId) {
        return ResponseEntity.ok(libraryService.getIssuesForStudent(studentId));
    }

    // View all checkout issues currently active (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/issues")
    public ResponseEntity<List<LibraryIssueDto>> getAllIssues() {
        return ResponseEntity.ok(libraryService.getAllIssues());
    }
}
