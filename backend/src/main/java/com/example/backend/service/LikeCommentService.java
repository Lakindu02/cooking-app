package com.example.backend.service;

import com.example.backend.exception.CommentNotFoundException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.model.*;
import com.example.backend.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LikeCommentService {

    private final LikeCommentRepository likeCommentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public LikeCommentService(LikeCommentRepository likeCommentRepository) {
        this.likeCommentRepository = likeCommentRepository;
    }

    public void toggleLike(String postId, String userId, String username) {
        LikeComment existingLike = likeCommentRepository
                .findTopByPostIdAndUserIdAndLiked(postId, userId, true);

        if (existingLike == null) {
            LikeComment newLike = new LikeComment();
            newLike.setPostId(postId);
            newLike.setUserId(userId);
            newLike.setUsername(username);
            newLike.setLiked(true);
            likeCommentRepository.save(newLike);

            // Create notification for the post owner
            Post post = postRepository.findById(postId).orElse(null);
            if (post != null && !post.getUserEmail().equals(userId)) {
                Notification notification = new Notification(
                    post.getUserEmail(), // recipient
                    userId, // actor
                    postId,
                    "LIKE",
                    username + " liked your post"
                );
                notificationRepository.save(notification);
            }
        } else {
            likeCommentRepository.delete(existingLike);
        }
    }

    public LikeComment addComment(String postId, String userId, String username, String commentContent) {
        if (commentContent == null || commentContent.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }
        
        LikeComment comment = new LikeComment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setUsername(username);
        comment.setComment(commentContent.trim());
        comment.setLiked(false);
        LikeComment savedComment = likeCommentRepository.save(comment);

        // Create notification for the post owner
        Post post = postRepository.findById(postId).orElse(null);
        if (post != null && !post.getUserEmail().equals(userId)) {
            Notification notification = new Notification(
                post.getUserEmail(), // recipient
                userId, // actor
                postId,
                "COMMENT",
                username + " commented: " + commentContent.trim()
            );
            notificationRepository.save(notification);
        }

        return savedComment;
    }
    
    public void updateComment(String commentId, String userId, String newContent) {
        LikeComment comment = likeCommentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to update this comment");
        }

        comment.setComment(newContent);
        likeCommentRepository.save(comment);
    }

    public void deleteComment(String commentId, String userId) {
        LikeComment comment = likeCommentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to delete this comment");
        }

        likeCommentRepository.delete(comment);
    }

    public int getLikeCount(String postId) {
        return likeCommentRepository.countByPostIdAndLiked(postId, true);
    }

    public List<LikeComment> getComments(String postId) {
        return likeCommentRepository.findByPostIdAndCommentIsNotNull(postId);
    }

    public Map<String, Boolean> getUserLikeStatus(String postId, String userId) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("liked", likeCommentRepository.existsByPostIdAndUserIdAndLiked(postId, userId, true));
        return response;
    }

    // Notification functionality
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markNotificationAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
            
        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to modify this notification");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllNotificationsAsRead(String userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }
}