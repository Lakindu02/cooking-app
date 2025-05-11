package com.example.backend.controller;

import com.example.backend.model.SportCommunity;
import com.example.backend.model.CommunityPost;
import com.example.backend.repository.SportCommunityRepository;
import com.example.backend.repository.CommunityPostRepository;
import com.example.backend.service.SportCommunityService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
@CrossOrigin
public class SportCommunityController {

    @Autowired
    private SportCommunityRepository sportCommunityRepository;

    @Autowired
    private CommunityPostRepository communityPostRepository;

    @Autowired
    private SportCommunityService sportCommunityService;

    // Create a new sport community
    @PostMapping
    public SportCommunity createCommunity(@RequestBody SportCommunity sportCommunity) {
        try {
            return sportCommunityRepository.save(sportCommunity);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating community", e);
        }
    }

    // Get all sport communities
    @GetMapping
    public List<SportCommunity> getAllCommunities() {
        try {
            return sportCommunityRepository.findAll();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching communities", e);
        }
    }

    // Get user's communities
    @GetMapping("/user-communities")
    public ResponseEntity<List<SportCommunity>> getUserCommunities(@RequestParam String userName) {
        try {
            List<SportCommunity> communities = sportCommunityService.getCommunitiesByUser(userName);
            return ResponseEntity.ok(communities);
        } catch (Exception e) {
            System.err.println("Error fetching user communities: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }

    // Get a specific sport community by ID
    @GetMapping("/{id}")
    public SportCommunity getCommunityById(@PathVariable String id) {
        return sportCommunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));
    }

    // Join a sport community
    @PostMapping("/{id}/join")
    public SportCommunity joinCommunity(@PathVariable String id, @RequestParam String userName) {
        SportCommunity community = sportCommunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        List<String> members = community.getMembers();
        if (!members.contains(userName)) {
            members.add(userName);
            community.setMembers(members);
            return sportCommunityRepository.save(community);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already a member.");
        }
    }

    // Leave a community
    @PostMapping("/{id}/leave")
    public SportCommunity leaveCommunity(@PathVariable String id, @RequestParam String userName) {
        SportCommunity community = sportCommunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        List<String> members = community.getMembers();
        if (members.contains(userName)) {
            members.remove(userName);
            community.setMembers(members);
            return sportCommunityRepository.save(community);
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
    public ResponseEntity<SportCommunity> updateCommunity(@PathVariable String id,
            @RequestBody SportCommunity updatedCommunity) {
        return sportCommunityRepository.findById(id)
                .map(community -> {
                    community.setName(updatedCommunity.getName());
                    community.setDescription(updatedCommunity.getDescription());
                    sportCommunityRepository.save(community);
                    return ResponseEntity.ok(community);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a community
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCommunity(@PathVariable String id) {
        SportCommunity community = sportCommunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        community.cleanUpMembers();
        sportCommunityRepository.deleteById(id);
        return ResponseEntity.ok("Community deleted successfully.");
    }
}
