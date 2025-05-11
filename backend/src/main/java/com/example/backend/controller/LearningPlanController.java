package com.example.backend.controller;

import com.example.backend.model.LearningPlan;
import com.example.backend.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/learningplans")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    // Create a new Learning Plan
    @PostMapping
    public ResponseEntity<LearningPlan> createLearningPlan(
            @Valid @RequestPart("plan") LearningPlan learningPlan,
            @RequestPart(value = "media", required = false) MultipartFile mediaFile) {
        try {
            LearningPlan createdPlan = learningPlanService.createLearningPlan(learningPlan, mediaFile);
            return new ResponseEntity<>(createdPlan, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all Learning Plans
    @GetMapping
    public List<LearningPlan> getAllLearningPlans() {
        return learningPlanService.getAllLearningPlans();
    }

    // Get a Learning Plan by ID
    @GetMapping("/{id}")
    public ResponseEntity<LearningPlan> getLearningPlanById(@PathVariable String id) {
        Optional<LearningPlan> plan = learningPlanService.getLearningPlanById(id);
        return plan.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete Learning Plan by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningPlan(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean deleted = learningPlanService.deleteLearningPlan(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Update Learning Plan
    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updateLearningPlan(
            @PathVariable String id,
            @Valid @RequestPart("plan") LearningPlan updatedPlan,
            @RequestPart(value = "media", required = false) MultipartFile mediaFile) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Get the current plan to check ownership
        Optional<LearningPlan> existingPlan = learningPlanService.getLearningPlanById(id);
        if (existingPlan.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Check if the authenticated user is the owner of the plan
        String currentUserEmail = authentication.getName();
        if (!existingPlan.get().getUserEmail().equals(currentUserEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Set the user email on the updated plan
        updatedPlan.setUserEmail(currentUserEmail);

        try {
            LearningPlan updated = learningPlanService.updateLearningPlan(id, updatedPlan, mediaFile);
            if (updated != null) {
                return new ResponseEntity<>(updated, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}