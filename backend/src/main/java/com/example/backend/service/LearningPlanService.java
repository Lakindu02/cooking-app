package com.example.backend.service;

import com.example.backend.model.LearningPlan;
import com.example.backend.repository.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class LearningPlanService {

    @Autowired
    private LearningPlanRepository repository;

    @Autowired
    private FileStorageService fileStorageService;

    public LearningPlan createLearningPlan(LearningPlan learningPlan, MultipartFile mediaFile) throws IOException {
        if (mediaFile != null && !mediaFile.isEmpty()) {
            String filename = fileStorageService.storeFile(mediaFile);
            String fileUrl = fileStorageService.getFileUrl(filename);
            
            // Determine media type based on file extension
            String originalFilename = mediaFile.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            
            if (fileExtension.matches("\\.(jpg|jpeg|png|gif)$")) {
                learningPlan.setImage(fileUrl);
                learningPlan.setMediaType("IMAGE");
            } else if (fileExtension.matches("\\.(mp4|webm|ogg)$")) {
                learningPlan.setVideo(fileUrl);
                learningPlan.setMediaType("VIDEO");
            }
            
            learningPlan.setMediaSource("LOCAL");
        }
        
        return repository.save(learningPlan);
    }

    public List<LearningPlan> getAllLearningPlans() {
        return repository.findAll();
    }

    public Optional<LearningPlan> getLearningPlanById(String id) {
        return repository.findById(id);
    }

    public boolean deleteLearningPlan(String id) {
        Optional<LearningPlan> plan = repository.findById(id);
        if (plan.isPresent()) {
            LearningPlan learningPlan = plan.get();
            
            // Delete associated media files if they exist
            try {
                if (learningPlan.getMediaSource().equals("LOCAL")) {
                    if (learningPlan.getImage() != null) {
                        String imageFilename = learningPlan.getImage().substring(learningPlan.getImage().lastIndexOf("/") + 1);
                        fileStorageService.deleteFile(imageFilename);
                    }
                    if (learningPlan.getVideo() != null) {
                        String videoFilename = learningPlan.getVideo().substring(learningPlan.getVideo().lastIndexOf("/") + 1);
                        fileStorageService.deleteFile(videoFilename);
                    }
                }
            } catch (IOException e) {
                // Log the error but continue with deletion
                e.printStackTrace();
            }
            
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    public LearningPlan updateLearningPlan(String id, LearningPlan updatedPlan, MultipartFile mediaFile) throws IOException {
        Optional<LearningPlan> existingPlanOptional = getLearningPlanById(id);

        if (existingPlanOptional.isPresent()) {
            LearningPlan existingPlan = existingPlanOptional.get();

            // Handle media file upload if provided
            if (mediaFile != null && !mediaFile.isEmpty()) {
                // Delete old media files if they exist
                if (existingPlan.getMediaSource().equals("LOCAL")) {
                    if (existingPlan.getImage() != null) {
                        String imageFilename = existingPlan.getImage().substring(existingPlan.getImage().lastIndexOf("/") + 1);
                        fileStorageService.deleteFile(imageFilename);
                    }
                    if (existingPlan.getVideo() != null) {
                        String videoFilename = existingPlan.getVideo().substring(existingPlan.getVideo().lastIndexOf("/") + 1);
                        fileStorageService.deleteFile(videoFilename);
                    }
                }

                // Store new media file
                String filename = fileStorageService.storeFile(mediaFile);
                String fileUrl = fileStorageService.getFileUrl(filename);
                
                // Determine media type based on file extension
                String originalFilename = mediaFile.getOriginalFilename();
                String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
                
                if (fileExtension.matches("\\.(jpg|jpeg|png|gif)$")) {
                    updatedPlan.setImage(fileUrl);
                    updatedPlan.setVideo(null);
                    updatedPlan.setMediaType("IMAGE");
                } else if (fileExtension.matches("\\.(mp4|webm|ogg)$")) {
                    updatedPlan.setVideo(fileUrl);
                    updatedPlan.setImage(null);
                    updatedPlan.setMediaType("VIDEO");
                }
                
                updatedPlan.setMediaSource("LOCAL");
            }

            // Update other fields
            existingPlan.setTitle(updatedPlan.getTitle());
            existingPlan.setGoal(updatedPlan.getGoal());
            existingPlan.setSkills(updatedPlan.getSkills());
            existingPlan.setSteps(updatedPlan.getSteps());
            
            // Update media fields if new media was uploaded
            if (mediaFile != null && !mediaFile.isEmpty()) {
                existingPlan.setImage(updatedPlan.getImage());
                existingPlan.setVideo(updatedPlan.getVideo());
                existingPlan.setMediaType(updatedPlan.getMediaType());
                existingPlan.setMediaSource(updatedPlan.getMediaSource());
            }

            return repository.save(existingPlan);
        }
        return null;
    }
}
