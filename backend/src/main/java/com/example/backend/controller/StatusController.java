package com.example.backend.controller;

import com.example.backend.model.Status;
import com.example.backend.service.StatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/story")
public class StatusController {

    @Autowired
    private StatusService statusService;

    @PostMapping("/createStory")
    public ResponseEntity<String> createStory(@RequestParam("image") MultipartFile image,
                                              @RequestParam("userid") String userId,
                                              @RequestParam("description") String description,
                                              @RequestParam("uname") String uname
                                              ) {


        try {
            String uploadsDir = "status/";

            String fileName = image.getOriginalFilename();

            Status status = new Status(description, userId ,uname);

            Status createdStory = statusService.addStatus(status);

            String storyId = createdStory.getId();
            String filePath = uploadsDir + storyId + ".jpg";

            Path path = Paths.get(filePath);
            Files.write(path, image.getBytes());

            status.setImageUrl(filePath);
            statusService.updateStatus(status);

            return ResponseEntity.ok("Story created successfully");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error creating story: " + e.getMessage());
        }
    }

    @GetMapping("/getAllStatus")
    public ResponseEntity<List<Status>> getAllStatus() {
        List<Status> allStatus = statusService.getAllStatus();
        return ResponseEntity.ok(allStatus);
    }

    @PatchMapping("/updateStory")
    public ResponseEntity<?> updateStory(@RequestBody Map<String, String> requestBody) {
        String storyId = requestBody.get("id");
        String uname = requestBody.get("uname");
        String newDescription = requestBody.get("description");

        try {
            Status status = statusService.getStatusById(storyId);
            if (status == null) {
                return ResponseEntity.status(404).body("Story not found");
            }

            // Check if the story belongs to the user
            if (!status.getUname().equals(uname)) {
                return ResponseEntity.status(403).body("You are not authorized to update this story");
            }

            status.setDescription(newDescription);
            statusService.updateStatus(status);

            return ResponseEntity.ok("Story updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        }
    }


    @DeleteMapping("/deleteStory")
    public ResponseEntity<?> deleteStory(@RequestParam("id") String storyId,
                                        @RequestParam("uname") String uname) {
        try {
            Status status = statusService.getStatusById(storyId);
            if (status == null) {
                return ResponseEntity.status(404).body("Story not found");
            }

            if (!status.getUname().equals(uname)) {
                return ResponseEntity.status(403).body("You are not authorized to delete this story");
            }

            String uploadsDir = "status/";
            String filePath = uploadsDir + storyId + ".jpg";
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                Files.delete(path);
            }

            statusService.deleteStatusById(storyId);
            return ResponseEntity.ok("Story deleted successfully");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error deleting story: " + e.getMessage());
        }
    }

    
}

