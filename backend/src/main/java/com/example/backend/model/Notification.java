package com.example.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String userId; // recipient of the notification
    private String actorId; // user who performed the action
    private String postId;
    private String type; // "LIKE" or "COMMENT"
    private String content; // for comments, store the comment content
    private boolean isRead;
    private LocalDateTime createdAt;

    public Notification() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    public Notification(String userId, String actorId, String postId, String type, String content) {
        this.userId = userId;
        this.actorId = actorId;
        this.postId = postId;
        this.type = type;
        this.content = content;
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return content;
    }

    public void setMessage(String message) {
        this.content = message;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        this.isRead = read;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getReferenceId() {
        return postId;
    }

    public void setReferenceId(String referenceId) {
        this.postId = referenceId;
    }

    public long getTimestamp() {
        return createdAt.toEpochSecond(ZoneOffset.UTC);
    }

    public void setTimestamp(long timestamp) {
        this.createdAt = LocalDateTime.ofEpochSecond(timestamp, 0, ZoneOffset.UTC);
    }
} 

