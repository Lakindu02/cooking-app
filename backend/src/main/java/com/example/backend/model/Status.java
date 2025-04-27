package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "status")
public class Status {

    @Id
    private String id;
    private String description;
    private String uname;

    private String userId;
    private Date expiredAt;

    public Status() {
        this.expiredAt = new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000);
    }

    public Status(String description, String userId ,String uname) {
        this.description = description;
        this.uname = uname;
        this.userId = userId;
        this.expiredAt = new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000); // Set expiration to 24 hours
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUname() {
        return uname;
    }

    public void setUname(String uname) {
        this.uname = uname;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Date getExpiredAt() {
        return expiredAt;
    }

    public void setExpiredAt(Date expiredAt) {
        this.expiredAt = expiredAt;
    }

    public void setImageUrl(String filePath) {
    }
}
