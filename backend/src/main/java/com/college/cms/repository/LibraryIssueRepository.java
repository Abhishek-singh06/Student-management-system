package com.college.cms.repository;

import com.college.cms.entity.LibraryIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LibraryIssueRepository extends JpaRepository<LibraryIssue, Long> {
    List<LibraryIssue> findByStudentId(Long studentId);
    List<LibraryIssue> findByBookId(Long bookId);
    List<LibraryIssue> findByStudentIdAndStatus(Long studentId, String status);
    Optional<LibraryIssue> findByStudentIdAndBookIdAndStatus(Long studentId, Long bookId, String status);
}
