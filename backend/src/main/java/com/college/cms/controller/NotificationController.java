package com.college.cms.controller;

import com.college.cms.dto.NotificationDto;
import com.college.cms.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Publish announcements (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<NotificationDto> createNotification(@Valid @RequestBody NotificationDto dto) {
        NotificationDto saved = notificationService.createNotification(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Retrieve notifications based on target portal role (ALL, STUDENT, FACULTY)
    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(@RequestParam("role") String role) {
        List<NotificationDto> list = notificationService.getNotificationsForRole(role);
        return ResponseEntity.ok(list);
    }
}
