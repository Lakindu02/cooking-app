package com.example.backend.controller;

import com.example.backend.model.FoodCommunity;
import com.example.backend.model.CommunityPost;
import com.example.backend.repository.FoodCommunityRepository;
import com.example.backend.repository.CommunityPostRepository;
import com.example.backend.service.FoodCommunityService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
@CrossOrigin
public class FoodCommunityController {

    @Autowired
    private FoodCommunityRepository foodCommunityRepository;

    @Autowired
    private CommunityPostRepository communityPostRepository;

    @Autowired
    private FoodCommunityService foodCommunityService; // Inject FoodCommunityService properly

    // Create a new food community
    @PostMapping
    public FoodCommunity createCommunity(@RequestBody FoodCommunity foodCommunity) {
        try {
            return foodCommunityRepository.save(foodCommunity);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating community", e);
        }
    }

    // Get all food communities
    @GetMapping
    public List<FoodCommunity> getAllCommunities() {
        try {
            return foodCommunityRepository.findAll();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching communities", e);
        }
    }

    // Get user's communities
    @GetMapping("/user-communities")
    public ResponseEntity<List<FoodCommunity>> getUserCommunities(@RequestParam String userName) {
        try {
            List<FoodCommunity> communities = foodCommunityService.getCommunitiesByUser(userName);
            return ResponseEntity.ok(communities);
        } catch (Exception e) {
            System.err.println("Error fetching user communities: " + e.getMessage()); // Error log
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }

    // Get a specific food community by ID
    @GetMapping("/{id}")
    public FoodCommunity getCommunityById(@PathVariable String id) {
        return foodCommunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));
    }

    // Join a food community
    @PostMapping("/{id}/join")
    public FoodCommunity joinCommunity(@PathVariable String id, @RequestParam String userName) {
        FoodCommunity community = foodCommunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        List<String> members = community.getMembers();
        if (!members.contains(userName)) {
            members.add(userName);
            community.setMembers(members);
            return foodCommunityRepository.save(community);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already a member.");
        }
    }

    // Leave a community
    @PostMapping("/{id}/leave")
    public FoodCommunity leaveCommunity(@PathVariable String id, @RequestParam String userName) {
        FoodCommunity community = foodCommunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        List<String> members = community.getMembers();
        if (members.contains(userName)) {
            members.remove(userName);
            community.setMembers(members);
            return foodCommunityRepository.save(community);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a member of the community.");
        }
    }

    // Create a post for a community
    @PostMapping("/{id}/posts")
    public CommunityPost createPost(@PathVariable String id, @RequestBody CommunityPost post) {
        post.setCommunityId(id);
        return communityPostRepository.save(post);
    }

    // Get posts for a specific community
    @GetMapping("/{id}/posts")
    public List<CommunityPost> getPostsByCommunity(@PathVariable String id) {
        return communityPostRepository.findByCommunityId(id);
    }

    // Like a post
    @PostMapping("/{communityId}/posts/{postId}/like")
    public ResponseEntity<String> likePost(@PathVariable String communityId,
            @PathVariable String postId,
            @RequestParam String userName) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (post.getLikedBy().contains(userName)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User has already liked this post.");
        }

        post.getLikedBy().add(userName);
        post.setLikes(post.getLikes() + 1);
        communityPostRepository.save(post);

        return ResponseEntity.ok("Post liked successfully.");
    }

    // Update a community
    @PutMapping("/{id}")
    public ResponseEntity<FoodCommunity> updateCommunity(@PathVariable String id,
            @RequestBody FoodCommunity updatedCommunity) {
        return foodCommunityRepository.findById(id)
                .map(community -> {
                    community.setName(updatedCommunity.getName());
                    community.setDescription(updatedCommunity.getDescription());
                    foodCommunityRepository.save(community);
                    return ResponseEntity.ok(community);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a community
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCommunity(@PathVariable String id) {
        FoodCommunity community = foodCommunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        community.cleanUpMembers();
        foodCommunityRepository.deleteById(id);
        return ResponseEntity.ok("Community deleted successfully.");
    }
}
