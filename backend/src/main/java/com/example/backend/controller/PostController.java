package com.example.backend.controller;

import com.example.backend.dto.PostDTO;
import com.example.backend.model.Post;
import com.example.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    // Get all posts for the logged-in user
    @GetMapping("/byLoggedInUser")
    public List<PostDTO> getUserPostsByLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return postService.getPostsByUserEmail(userEmail);
    }

    // Create a post for the logged-in user
    @PostMapping
    public Post createPost(@RequestBody PostDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        dto.setUserEmail(userEmail);
        return postService.createPost(dto);
    }

    // Update a post
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable String id, @RequestBody PostDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        if (!postService.isPostOwnedByUser(id, userEmail)) {
            return ResponseEntity.status(403).build();
        }
        
        Post updatedPost = postService.updatePost(id, dto);
        return ResponseEntity.ok(updatedPost);
    }

    // Delete a post
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        if (!postService.isPostOwnedByUser(id, userEmail)) {
            return ResponseEntity.status(403).build();
        }
        
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    // Update the visibility of a post
    @PutMapping("/{id}/visibility")
    public ResponseEntity<Post> updateVisibility(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        Boolean isPublic = body.get("isPublic");
        if (isPublic == null) {
            return ResponseEntity.badRequest().build();
        }
        Post updatedPost = postService.updateVisibility(id, isPublic);
        return ResponseEntity.ok(updatedPost);
    }

    // Get only public posts for the home page
    @GetMapping("/public")
    public List<PostDTO> getPublicPosts() {
        return postService.getPublicPosts();
    }

    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadPostImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }

            // Get the absolute path to the project root directory
            String projectRoot = System.getProperty("user.dir");
            String uploadDir = projectRoot + File.separator + "uploads" + File.separator + "post-images";
            
            // Create uploads directory if it doesn't exist
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                boolean created = dir.mkdirs();
                if (!created) {
                    throw new RuntimeException("Failed to create upload directory: " + uploadDir);
                }
            }

            // Generate unique filename
            String fileName = userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + File.separator + fileName;

            // Save file
            File dest = new File(filePath);
            try {
                file.transferTo(dest);
            } catch (Exception e) {
                throw new RuntimeException("Failed to save file: " + e.getMessage(), e);
            }

            // Return the relative path for the frontend
            return ResponseEntity.ok("/uploads/post-images/" + fileName);
        } catch (Exception e) {
            e.printStackTrace(); // Print the full stack trace
            String errorMessage = "Failed to upload file: " + e.getMessage();
            if (e.getCause() != null) {
                errorMessage += " Cause: " + e.getCause().getMessage();
            }
            return ResponseEntity.status(500).body(errorMessage);
        }
    }
}