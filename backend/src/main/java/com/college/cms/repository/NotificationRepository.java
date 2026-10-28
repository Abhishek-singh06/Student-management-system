package com.college.cms.repository;

import com.college.cms.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetRoleOrTargetRoleOrderByDateDesc(String targetRole1, String targetRole2);
}
