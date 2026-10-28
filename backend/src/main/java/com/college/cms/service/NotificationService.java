package com.college.cms.service;

import com.college.cms.dto.NotificationDto;
import java.util.List;

public interface NotificationService {
    NotificationDto createNotification(NotificationDto dto);
    List<NotificationDto> getNotificationsForRole(String role);
}
