package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.ProfileDTO;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.model.Skill;
import com.example.backend.model.User;
import com.example.backend.model.UserSkill;
import com.example.backend.repository.SkillRepository;
import com.example.backend.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SkillRepository skillRepository;

    public UserService(PasswordEncoder passwordEncoder,
            JwtService jwtService,
            SkillRepository skillRepository) {
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.skillRepository = skillRepository;
    }

    // Authentication methods
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtService.generateToken(user);
        String welcomeMessage = "Welcome back, " + user.getUsername() + "!";
        return new AuthResponse(token, welcomeMessage, user.getId());
    }

    public AuthResponse googleLogin(Map<String, String> body) {
        String idTokenString = body.get("token");

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    JacksonFactory.getDefaultInstance())
                    .setAudience(Collections
                            .singletonList("661135922934-bq9m34un9dn036j3jtjunvejlitd4ide.apps.googleusercontent.com"))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                Payload payload = idToken.getPayload();

                String email = payload.getEmail();
                String name = (String) payload.get("name");

                User user = userRepository.findByEmail(email).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setUsername(name);
                    return userRepository.save(newUser);
                });

                String jwt = jwtService.generateToken(user);
                return new AuthResponse(jwt, "Welcome back, " + user.getUsername() + "!", user.getId());
            } else {
                throw new RuntimeException("Invalid Google ID token");
            }

        } catch (GeneralSecurityException | IOException e) {
            throw new RuntimeException("Google token verification failed", e);
        }
    }

    // Profile methods
    public User getCurrentUserProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUserProfile(ProfileDTO profileDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(profileDTO.getUsername());
        user.setPhoneNo(profileDTO.getPhoneNo());
        user.setAddress(profileDTO.getAddress());
        user.setEducation(profileDTO.getEducation());

        if (profileDTO.getSkills() != null) {
            List<UserSkill> userSkills = profileDTO.getSkills().stream()
                    .map(skillDTO -> new UserSkill(skillDTO.getSport(), skillDTO.getSkillName()))
                    .collect(Collectors.toList());
            user.setSkills(userSkills);
        }

        return userRepository.save(user);
    }

    // Skill methods
    public List<String> getAllSports() {
        // Option 1: Direct string list
        // return skillRepository.findDistinctSports();

        // OR Option 2: If you need to process the skills first
        return skillRepository.findAllSports()
                .stream()
                .map(Skill::getSport)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<String> getSkillsBySport(String sport) {
        return skillRepository.findBySport(sport)
                .stream()
                .map(Skill::getSkillName)
                .collect(Collectors.toList());
    }

    // Utility method for updating password
    public void updatePassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public List<ProfileDTO> getAllUsers() {
        String currentUserId = getCurrentUserId();
        return userRepository.findAll().stream()
                .map(user -> convertToProfileDTO(user, currentUserId))
                .collect(Collectors.toList());
    }

    // UserService.java
    public User followUser(String followerId, String followingId) {
        System.out.println("=== Follow User Request ===");
        System.out.println("Follower ID: " + followerId);
        System.out.println("Following ID: " + followingId);
        
        // Prevent self-following
        if (followerId.equals(followingId)) {
            System.out.println("Error: Self-following attempt detected");
            throw new RuntimeException("You cannot follow yourself");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> {
                    System.out.println("Error: Follower not found with ID: " + followerId);
                    return new RuntimeException("Follower not found");
                });
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> {
                    System.out.println("Error: User to follow not found with ID: " + followingId);
                    return new RuntimeException("User to follow not found");
                });

        System.out.println("Found users:");
        System.out.println("- Follower: " + follower.getUsername() + " (ID: " + follower.getId() + ")");
        System.out.println("- Following: " + following.getUsername() + " (ID: " + following.getId() + ")");

        // Check if already following
        if (follower.getFollowing().contains(followingId)) {
            System.out.println("Error: Already following - Follower's following list: " + follower.getFollowing());
            throw new RuntimeException("You are already following this user");
        }

        System.out.println("Current state:");
        System.out.println("- Follower's following list: " + follower.getFollowing());
        System.out.println("- Following's followers list: " + following.getFollowers());

        // Add to following list
        follower.addFollowing(followingId);
        // Add to followers list
        following.addFollower(followerId);

        System.out.println("Updated state:");
        System.out.println("- Follower's following list: " + follower.getFollowing());
        System.out.println("- Following's followers list: " + following.getFollowers());

        try {
            // Save both users
            userRepository.save(following);
            User savedFollower = userRepository.save(follower);
            System.out.println("Successfully saved both users");
            return savedFollower;
        } catch (Exception e) {
            System.out.println("Error saving users: " + e.getMessage());
            throw new RuntimeException("Failed to save follow relationship: " + e.getMessage());
        }
    }

    public User unfollowUser(String followerId, String followingId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new RuntimeException("User to unfollow not found"));

        // Remove from following list
        follower.removeFollowing(followingId);
        // Remove from followers list
        following.removeFollower(followerId);

        userRepository.save(following);
        return userRepository.save(follower);
    }

    public boolean isFollowing(String followerId, String followingId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        return follower.getFollowing().contains(followingId);
    }

    public List<User> getFollowers(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userRepository.findAllById(user.getFollowers());
    }

    public List<User> getFollowing(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userRepository.findAllById(user.getFollowing());
    }

    private ProfileDTO convertToProfileDTO(User user, String currentUserId) {
        ProfileDTO dto = new ProfileDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhoneNo(user.getPhoneNo());
        dto.setAddress(user.getAddress());
        dto.setEducation(user.getEducation());
        dto.setPhotoURL(user.getPhotoURL());

        dto.setFollowersCount(user.getFollowers().size());
        dto.setFollowingCount(user.getFollowing().size());
        dto.setFollowing(currentUserId != null &&
                !currentUserId.equals(user.getId()) &&
                user.getFollowers().contains(currentUserId));

        return dto;
    }

    private String getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null ? user.getId() : null;
    }

    public Optional<ProfileDTO> getUserById(String id) {
        return userRepository.findById(id)
                .map(user -> convertToProfileDTO(user, getCurrentUserId()));
    }

    public List<ProfileDTO> getUserFollowers(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userRepository.findAllById(user.getFollowers())
                .stream()
                .map(follower -> convertToProfileDTO(follower, getCurrentUserId()))
                .collect(Collectors.toList());
    }

    public List<ProfileDTO> getUserFollowing(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userRepository.findAllById(user.getFollowing())
                .stream()
                .map(following -> convertToProfileDTO(following, getCurrentUserId()))
                .collect(Collectors.toList());
    }

    public ProfileDTO getUserProfileById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToProfileDTO(user, getCurrentUserId());
    }
}