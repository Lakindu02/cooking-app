package com.example.backend.service;

import com.example.backend.dto.PostDTO;
import com.example.backend.exception.PostNotFoundException;
import com.example.backend.model.Post;
import com.example.backend.model.User;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    // Get posts by email
    public List<PostDTO> getPostsByUserEmail(String email) {
        List<Post> posts = postRepository.findByUserEmail(email);

        return posts.stream().map(post -> {
            User user = userRepository.findByEmail(post.getUserEmail()).orElse(null);
            String username = (user != null) ? user.getUsername() : "Unknown";

            PostDTO postDTO = new PostDTO();
            postDTO.setId(post.getId());
            postDTO.setUserEmail(post.getUserEmail());
            postDTO.setTitle(post.getTitle());
            postDTO.setContent(post.getContent());
            postDTO.setImage(post.getImage());
            postDTO.setIsPublic(post.getIsPublic());
            postDTO.setUsername(username);
            return postDTO;
        }).collect(Collectors.toList());
    }

    // Get only public posts
    public List<PostDTO> getPublicPosts() {
        List<Post> posts = postRepository.findByIsPublicTrue();

        return posts.stream().map(post -> {
            User user = userRepository.findByEmail(post.getUserEmail()).orElse(null);
            String username = (user != null) ? user.getUsername() : "Unknown";

            PostDTO postDTO = new PostDTO();
            postDTO.setId(post.getId());
            postDTO.setUserEmail(post.getUserEmail());
            postDTO.setTitle(post.getTitle());
            postDTO.setContent(post.getContent());
            postDTO.setImage(post.getImage());
            postDTO.setIsPublic(post.getIsPublic());
            postDTO.setUsername(username);
            return postDTO;
        }).collect(Collectors.toList());
    }

    // Create a post for the logged-in user
    public Post createPost(PostDTO dto) {
        if (dto.getUserEmail() == null || dto.getUserEmail().isEmpty()) {
            throw new IllegalArgumentException("User email is required to create a post.");
        }

        Post post = new Post();
        post.setUserEmail(dto.getUserEmail());
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setImage(dto.getImage());
        post.setIsPublic(dto.getIsPublic());

        return postRepository.save(post);
    }

    // Update a post
    public Post updatePost(String id, PostDTO dto) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + id));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInUserEmail = authentication.getName();

        if (!post.getUserEmail().equals(loggedInUserEmail)) {
            throw new AccessDeniedException("You do not have permission to update this post.");
        }

        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setImage(dto.getImage());
        post.setIsPublic(dto.getIsPublic());

        return postRepository.save(post);
    }

    // Delete a post
    public void deletePost(String id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + id));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInUserEmail = authentication.getName();

        if (!post.getUserEmail().equals(loggedInUserEmail)) {
            throw new AccessDeniedException("You do not have permission to delete this post.");
        }

        postRepository.delete(post);
    }

    // Update visibility of the post
    public Post updateVisibility(String postId, boolean isPublic) {
        Optional<Post> postOptional = postRepository.findById(postId);
        if (postOptional.isPresent()) {
            Post post = postOptional.get();
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String loggedInUserEmail = authentication.getName();

            if (!post.getUserEmail().equals(loggedInUserEmail)) {
                throw new AccessDeniedException("You do not have permission to update this post.");
            }

            post.setIsPublic(isPublic);
            return postRepository.save(post);
        } else {
            throw new PostNotFoundException("Post not found with id: " + postId);
        }
    }

    public boolean isPostOwnedByUser(String postId, String userEmail) {
        return postRepository.existsByIdAndUserEmail(postId, userEmail);
    }
}