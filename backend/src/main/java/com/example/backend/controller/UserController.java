package com.example.backend.controller;

import com.example.backend.dto.ProfileDTO;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Add these new endpoints
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        User user = userService.getCurrentUserProfile();
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody ProfileDTO profileDTO) {
        User updatedUser = userService.updateUserProfile(profileDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/skills/sports")
    public ResponseEntity<List<String>> getAllSports() {
        List<String> sports = userService.getAllSports();
        return ResponseEntity.ok(sports);
    }

    @GetMapping("/skills/{sport}")
    public ResponseEntity<List<String>> getSkillsBySport(@PathVariable String sport) {
        List<String> skills = userService.getSkillsBySport(sport);
        return ResponseEntity.ok(skills);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProfileDTO>> getAllUsers() {
        List<ProfileDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<ProfileDTO>> getUserFollowers(@PathVariable String userId) {
        List<ProfileDTO> followers = userService.getUserFollowers(userId);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<List<ProfileDTO>> getUserFollowing(@PathVariable String userId) {
        List<ProfileDTO> following = userService.getUserFollowing(userId);
        return ResponseEntity.ok(following);
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<ProfileDTO> getUserProfile(@PathVariable String userId) {
        ProfileDTO profile = userService.getUserProfileById(userId);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfileDTO> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{followerId}/follow/{followingId}")
    public ResponseEntity<?> followUser(
            @PathVariable String followerId,
            @PathVariable String followingId) {
        try {
            User updatedUser = userService.followUser(followerId, followingId);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{followerId}/unfollow/{followingId}")
    public ResponseEntity<User> unfollowUser(
            @PathVariable String followerId,
            @PathVariable String followingId) {
        try {
            User updatedUser = userService.unfollowUser(followerId, followingId);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{followerId}/is-following/{followingId}")
    public ResponseEntity<Boolean> isFollowing(
            @PathVariable String followerId,
            @PathVariable String followingId) {
        try {
            boolean isFollowing = userService.isFollowing(followerId, followingId);
            return ResponseEntity.ok(isFollowing);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/profile/picture")
    public ResponseEntity<String> uploadProfilePicture(
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

            // Create uploads directory if it doesn't exist
            String uploadDir = "uploads/profile-pictures";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // Generate unique filename
            String fileName = userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + "/" + fileName;

            // Save file
            File dest = new File(filePath);
            file.transferTo(dest);

            // Update user's profile picture URL
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setPhotoURL("/uploads/profile-pictures/" + fileName);
            userRepository.save(user);

            return ResponseEntity.ok("/uploads/profile-pictures/" + fileName);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }
}