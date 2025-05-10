package com.example.backend.controller;

import com.example.backend.model.LikeComment;
import com.example.backend.service.LikeCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/likecomment")
public class LikeCommentController {

    @Autowired
    private LikeCommentService likeCommentService;

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
}