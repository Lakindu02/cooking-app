package com.example.backend.controller;

import com.example.backend.dto.ProfileDTO;
import com.example.backend.model.User;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

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
}