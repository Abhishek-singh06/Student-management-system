package com.college.cms.service;

import com.college.cms.dto.LibraryBookDto;
import com.college.cms.dto.LibraryIssueDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface LibraryService {
    LibraryBookDto addBook(LibraryBookDto bookDto);
    void deleteBook(Long id);
    LibraryIssueDto issueBook(String rollNumber, String isbn);
    LibraryIssueDto returnBook(String rollNumber, String isbn);
    Page<LibraryBookDto> searchBooks(String query, int page, int size);
    List<LibraryIssueDto> getIssuesForStudent(Long studentId);
    List<LibraryIssueDto> getAllIssues();
}
