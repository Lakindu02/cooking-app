package com.example.backend.repository;

import com.example.backend.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends MongoRepository<Post, String> {
    // Find posts by user's email
    List<Post> findByUserEmail(String userEmail);

    // Get only public posts
    List<Post> findByIsPublicTrue();

    // Check if a post exists with given ID and user email (for ownership verification)
    boolean existsByIdAndUserEmail(String id, String userEmail);

    // Find post by ID with user email verification
    Optional<Post> findByIdAndUserEmail(String id, String userEmail);

    // Additional useful query methods
    List<Post> findByUserEmailAndIsPublic(String userEmail, boolean isPublic);
    
    // Count posts by user
    long countByUserEmail(String userEmail);
}