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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SkillRepository skillRepository;

    public UserService(UserRepository userRepo,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            SkillRepository skillRepository) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.skillRepository = skillRepository;
    }

    // Authentication methods
    public AuthResponse register(RegisterRequest request) {
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepo.save(user);
        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtService.generateToken(user);
        String welcomeMessage = "Welcome back, " + user.getUsername() + "!";
        return new AuthResponse(token, welcomeMessage);
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

                User user = userRepo.findByEmail(email).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setUsername(name);
                    return userRepo.save(newUser);
                });

                String jwt = jwtService.generateToken(user);
                return new AuthResponse(jwt, "Welcome back, " + user.getUsername() + "!");
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
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUserProfile(ProfileDTO profileDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByEmail(email)
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

        return userRepo.save(user);
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
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }

    public List<ProfileDTO> getAllUsers() {
        String currentUserId = getCurrentUserId();
        return userRepo.findAll().stream()
                .map(user -> convertToProfileDTO(user, currentUserId))
                .collect(Collectors.toList());
    }

    // UserService.java
    public void followUser(String followerId, String userIdToFollow) {
        User follower = userRepo.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User userToFollow = userRepo.findById(userIdToFollow)
                .orElseThrow(() -> new RuntimeException("User to follow not found"));

        if (!follower.getFollowing().contains(userIdToFollow)) {
            follower.getFollowing().add(userIdToFollow);
            userToFollow.getFollowers().add(followerId);
            userRepo.saveAll(List.of(follower, userToFollow));
        }
    }

    public void unfollowUser(String followerId, String userIdToUnfollow) {
        User follower = userRepo.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User userToUnfollow = userRepo.findById(userIdToUnfollow)
                .orElseThrow(() -> new RuntimeException("User to unfollow not found"));

        follower.getFollowing().remove(userIdToUnfollow);
        userToUnfollow.getFollowers().remove(followerId);
        userRepo.saveAll(List.of(follower, userToUnfollow));
    }

    public List<ProfileDTO> getUserFollowers(String userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String currentUserId = getCurrentUserId();
        return userRepo.findAllById(user.getFollowers())
                .stream()
                .map(follower -> convertToProfileDTO(follower, currentUserId))
                .collect(Collectors.toList());
    }

    public List<ProfileDTO> getUserFollowing(String userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String currentUserId = getCurrentUserId();
        return userRepo.findAllById(user.getFollowing())
                .stream()
                .map(following -> convertToProfileDTO(following, currentUserId))
                .collect(Collectors.toList());
    }

    public ProfileDTO getUserProfileById(String userId) {
        String currentUserId = getCurrentUserId();
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToProfileDTO(user, currentUserId);
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
        User user = userRepo.findByEmail(email).orElse(null);
        return user != null ? user.getId() : null;
    }
}