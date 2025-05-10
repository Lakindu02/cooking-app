package com.example.backend.service;

import com.example.backend.exception.CommentNotFoundException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.model.LikeComment;
import com.example.backend.repository.LikeCommentRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LikeCommentService {

    private final LikeCommentRepository likeCommentRepository;

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
        } else {
            likeCommentRepository.delete(existingLike);
        }
    }

    public LikeComment addComment(String postId, String userId, String username, String commentContent) {
        LikeComment comment = new LikeComment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setUsername(username);
        comment.setComment(commentContent);
        comment.setLiked(false);
        return likeCommentRepository.save(comment);
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
}