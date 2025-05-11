package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Document(collection = "learning_plans")
public class LearningPlan {

    @Id
    private String id;

    @NotBlank
    private String title;

    @NotBlank
    private String goal;

    @NotBlank
    private String skills;

    private String image;
    private String video;
    private String mediaType; // "IMAGE", "VIDEO", or "NONE"
    private String mediaSource; // "LOCAL" or "REMOTE"
    private String userEmail; // Email of the user who created the plan

    private List<Step> steps;

    // Constructors
    public LearningPlan() {}

    public LearningPlan(String id, String title, String goal, String skills, String image, String video, String mediaType, String mediaSource, String userEmail, List<Step> steps) {
        this.id = id;
        this.title = title;
        this.goal = goal;
        this.skills = skills;
        this.image = image;
        this.video = video;
        this.mediaType = mediaType;
        this.mediaSource = mediaSource;
        this.userEmail = userEmail;
        this.steps = steps;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getVideo() {
        return video;
    }

    public void setVideo(String video) {
        this.video = video;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public String getMediaSource() {
        return mediaSource;
    }

    public void setMediaSource(String mediaSource) {
        this.mediaSource = mediaSource;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public List<Step> getSteps() {
        return steps;
    }

    public void setSteps(List<Step> steps) {
        this.steps = steps;
    }

    // Inner Step class
    public static class Step {
        private String topic;
        private String resources;
        private String timeline;
        private String mediaUrl; // URL for step-specific media
        private String mediaType; // "IMAGE", "VIDEO", or "NONE"
        private String mediaSource; // "LOCAL" or "REMOTE"

        // Constructors
        public Step() {}

        public Step(String topic, String resources, String timeline, String mediaUrl, String mediaType, String mediaSource) {
            this.topic = topic;
            this.resources = resources;
            this.timeline = timeline;
            this.mediaUrl = mediaUrl;
            this.mediaType = mediaType;
            this.mediaSource = mediaSource;
        }

        // Getters and Setters
        public String getTopic() {
            return topic;
        }

        public void setTopic(String topic) {
            this.topic = topic;
        }

        public String getResources() {
            return resources;
        }

        public void setResources(String resources) {
            this.resources = resources;
        }

        public String getTimeline() {
            return timeline;
        }

        public void setTimeline(String timeline) {
            this.timeline = timeline;
        }

        public String getMediaUrl() {
            return mediaUrl;
        }

        public void setMediaUrl(String mediaUrl) {
            this.mediaUrl = mediaUrl;
        }

        public String getMediaType() {
            return mediaType;
        }

        public void setMediaType(String mediaType) {
            this.mediaType = mediaType;
        }

        public String getMediaSource() {
            return mediaSource;
        }

        public void setMediaSource(String mediaSource) {
            this.mediaSource = mediaSource;
        }
    }
}