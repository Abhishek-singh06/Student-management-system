package com.college.cms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "library_books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 255)
    private String author;

    @Column(unique = true, length = 20)
    private String isbn;

    @Column(length = 100)
    private String publisher;

    @Builder.Default
    @Column(name = "total_copies", nullable = false)
    private Integer totalCopies = 1;

    @Builder.Default
    @Column(name = "available_copies", nullable = false)
    private Integer availableCopies = 1;

    @Column(length = 50)
    private String category;
}
