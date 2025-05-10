package com.example.backend.service;

import com.example.backend.model.Status;
import com.example.backend.repository.StatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatusServiceImpl implements StatusService {

    @Autowired
    private StatusRepository statusRepository;

    @Override
    public Status addStatus(Status status) {
        return statusRepository.save(status);
    }

    @Override
    public Status getStatusById(String id) {
        return statusRepository.findById(id).orElse(null);
    }

    @Override
    public void updateStatus(Status status) {
        statusRepository.save(status);
    }

    @Override
    public List<Status> getAllStatus() {
        Date currentDate = new Date();

        List<Status> allStatuses = statusRepository.findAll();

        // Filter out the expired statuses
        return allStatuses.stream()
                .filter(status -> status.getExpiredAt().after(currentDate))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteExpiredStatuses() {
        Date currentDate = new Date();
        List<Status> expiredStatuses = statusRepository.findByExpiredAtBefore(currentDate);

        for (Status status : expiredStatuses) {
            deleteStatusById(status.getId()); // Call the new method for cleanup
        }
    }

    @Override
    public void deleteStatusById(String id) {
        try {
            Status status = getStatusById(id);
            if (status == null) {
                return; // No need to delete if status is not found
            }

            // Delete the associated image file
            String imagePath = "status/" + id + ".jpg";
            Path path = Paths.get(imagePath);
            if (Files.exists(path)) {
                Files.delete(path);
            }

            // Delete the status from the database
            statusRepository.deleteById(id);
        } catch (Exception e) {
            System.err.println("Error deleting status with ID " + id + ": " + e.getMessage());
        }
    }

    @Scheduled(cron = "*/50 * * * * *") //"0 */10 * * * *"
    public void scheduleTaskToDeleteExpiredStatuses() {
        deleteExpiredStatuses();
    }
}
