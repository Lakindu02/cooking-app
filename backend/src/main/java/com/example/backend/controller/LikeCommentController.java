package com.example.backend.controller;

import com.example.backend.model.LikeComment;
import com.example.backend.model.Notification;
import com.example.backend.service.LikeCommentService;
import com.example.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.backend.repository.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/likecomment")
public class LikeCommentController {

    @Autowired
    private LikeCommentService likeCommentService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/toggle-like/{postId}")
    public ResponseEntity<String> toggleLike(
            @PathVariable String postId,
            @RequestHeader("userId") String userId,
            @RequestHeader("username") String username) {
        likeCommentService.toggleLike(postId, userId, username);
        return ResponseEntity.ok("Like status toggled successfully.");
    }

    @PostMapping("/comment/{postId}")
    public ResponseEntity<String> addComment(
            @PathVariable String postId,
            @RequestHeader("userId") String userId,
            @RequestHeader("username") String username,
            @RequestBody String commentContent) {
        LikeComment comment = likeCommentService.addComment(postId, userId, username, commentContent);
        return ResponseEntity.ok("Comment added successfully with ID: " + comment.getId());
    }

    @PutMapping("/comment/{commentId}")
    public ResponseEntity<String> updateComment(
            @PathVariable String commentId,
            @RequestHeader("userId") String userId,
            @RequestBody String newContent) {
        likeCommentService.updateComment(commentId, userId, newContent);
        return ResponseEntity.ok("Comment updated successfully.");
    }

    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable String commentId,
            @RequestHeader("userId") String userId) {
        likeCommentService.deleteComment(commentId, userId);
        return ResponseEntity.ok("Comment deleted successfully.");
    }

    @GetMapping("/likes/count/{postId}")
    public ResponseEntity<Integer> getLikeCount(@PathVariable String postId) {
        return ResponseEntity.ok(likeCommentService.getLikeCount(postId));
    }

    @GetMapping("/comments/{postId}")
    public ResponseEntity<List<LikeComment>> getComments(@PathVariable String postId) {
        return ResponseEntity.ok(likeCommentService.getComments(postId));
    }

    @GetMapping("/user-like/{postId}")
    public ResponseEntity<Map<String, Boolean>> getUserLikeStatus(
            @PathVariable String postId,
            @RequestHeader("userId") String userId) {
        return ResponseEntity.ok(likeCommentService.getUserLikeStatus(postId, userId));
    }

    // Notification endpoints
    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractEmail(token.replace("Bearer ", ""));
            List<Notification> notifications = likeCommentService.getUserNotifications(email);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error getting notifications: " + e.getMessage());
        }
    }

    @GetMapping("/notifications/unread")
    public ResponseEntity<?> getUnreadNotifications(
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractEmail(token.replace("Bearer ", ""));
            List<Notification> notifications = likeCommentService.getUnreadNotifications(email);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error getting unread notifications: " + e.getMessage());
        }
    }

    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<?> markNotificationAsRead(
            @PathVariable String notificationId,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractEmail(token.replace("Bearer ", ""));
            likeCommentService.markNotificationAsRead(notificationId, email);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error marking notification as read: " + e.getMessage());
        }
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<?> markAllNotificationsAsRead(
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractEmail(token.replace("Bearer ", ""));
            likeCommentService.markAllNotificationsAsRead(email);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error marking all notifications as read: " + e.getMessage());
        }
    }
}