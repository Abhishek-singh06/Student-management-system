package com.college.cms.service.impl;

import com.college.cms.dto.NotificationDto;
import com.college.cms.entity.Notification;
import com.college.cms.repository.NotificationRepository;
import com.college.cms.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional
    public NotificationDto createNotification(NotificationDto dto) {
        Notification notification = Notification.builder()
                .title(dto.getTitle())
                .message(dto.getMessage())
                .targetRole(dto.getTargetRole().toUpperCase())
                .build();
        Notification saved = notificationRepository.save(notification);
        return mapToDto(saved);
    }

    @Override
    public List<NotificationDto> getNotificationsForRole(String role) {
        // Fetch notifications targeting the user's role OR 'ALL'
        String target = role.toUpperCase();
        return notificationRepository.findByTargetRoleOrTargetRoleOrderByDateDesc("ALL", target).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private NotificationDto mapToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .targetRole(notification.getTargetRole())
                .date(notification.getDate())
                .build();
    }
}
