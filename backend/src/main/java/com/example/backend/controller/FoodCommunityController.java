package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.example.backend.model.FoodCommunity;
import com.example.backend.model.CommunityPost;
import com.example.backend.repository.FoodCommunityRepository;
import com.example.backend.repository.CommunityPostRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;


ggsgggs
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/communities")
@CrossOrigin
public class FoodCommunityController {

    @Autowired
    private FoodCommunityRepository foodCommunityRepository;

    @Autowired
    private CommunityPostRepository communityPostRepository;

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

    // Get a specific food community by ID
    @GetMapping("/{id}")
    public FoodCommunity getCommunityById(@PathVariable String id) {
        try {
            Optional<FoodCommunity> community = foodCommunityRepository.findById(id);
            if (community.isPresent()) {
                return community.get();
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching community", e);
        }
    }

    // Join a food community
    @PostMapping("/{id}/join")
    public FoodCommunity joinCommunity(@PathVariable String id, @RequestParam String userName) {
        System.out.println("Joining community: " + id + " by " + userName);

        Optional<FoodCommunity> optionalCommunity = foodCommunityRepository.findById(id);

        if (optionalCommunity.isPresent()) {
            FoodCommunity community = optionalCommunity.get();
            List<String> members = community.getMembers();

            if (!members.contains(userName)) {
                members.add(userName);
                community.setMembers(members);
                System.out.println("Added member: " + userName);
                return foodCommunityRepository.save(community);
            } else {
                System.out.println(userName + " is already a member.");
                return community;
            }
        } else {
            System.out.println("Community not found: " + id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found");
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
    }dkdkkdkd

   @PostMapping("/{id}/leave")
public FoodCommunity leaveCommunity(@PathVariable String id, @RequestParam String userName) {
    Optional<FoodCommunity> optionalCommunity = foodCommunityRepository.findById(id);

    if (optionalCommunity.isPresent()) {
        FoodCommunity community = optionalCommunity.get();
        List<String> members = community.getMembers();

        if (members.contains(userName)) {
            members.remove(userName);
            community.setMembers(members);
            return foodCommunityRepository.save(community);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a member of the community.");
        }
    } else {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found");
    }
}


@PostMapping("/{communityId}/posts/{postId}/like")
public ResponseEntity<?> likePost(@PathVariable String communityId,
                                  @PathVariable String postId,
                                  @RequestParam String userName) {
    Optional<CommunityPost> postOptional = communityPostRepository.findById(postId);

    if (postOptional.isPresent()) {
        CommunityPost post = postOptional.get();

        // If you are using a Set of Users for likes, ensure you're modifying it correctly
        if (post.getLikedBy().contains(userName)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User has already liked this post.");
        }

        post.getLikedBy().add(userName);  // Add the user to the set of users who liked the post
        post.setLikes(post.getLikes() + 1);  // Increment the like count
        communityPostRepository.save(post);

        return ResponseEntity.ok("Post liked successfully.");
    } else {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found.");
    }
}

@PutMapping("/{id}")
public ResponseEntity<FoodCommunity> updateCommunity(@PathVariable String id, @RequestBody FoodCommunity updatedCommunity) {
    Optional<FoodCommunity> optionalCommunity = foodCommunityRepository.findById(id);
    if (optionalCommunity.isPresent()) {
        FoodCommunity community = optionalCommunity.get();
        community.setName(updatedCommunity.getName());
        community.setDescription(updatedCommunity.getDescription());
        foodCommunityRepository.save(community);
        return ResponseEntity.ok(community);
    } else {
        return ResponseEntity.notFound().build();
    }
}


@DeleteMapping("/{id}")
public ResponseEntity<?> deleteCommunity(@PathVariable String id) {
    try {
        Optional<FoodCommunity> optionalCommunity = foodCommunityRepository.findById(id);

        if (optionalCommunity.isPresent()) {
            FoodCommunity community = optionalCommunity.get();
            community.cleanUpMembers();  // Clean up members before deleting the community
            
            foodCommunityRepository.deleteById(id);  // Delete the community by ID
            return ResponseEntity.ok("Community deleted successfully.");
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found");
        }
    } catch (Exception e) {
        // Log the error for debugging
        e.printStackTrace();
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting community", e);
    }
}

}
