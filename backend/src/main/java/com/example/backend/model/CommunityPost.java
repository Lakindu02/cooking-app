package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Set;
import java.util.HashSet;


@Document(collection = "communityposts")
public class CommunityPost {
    @Id
    private String id;
    private String communityId;
    private String author;
    private String content;
    private String image;
    private String date;
private int likes;  // Change this to an int if you want to track the like count.
    private Set<String> likedBy = new HashSet<>();
    


    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCommunityId() { return communityId; }
    public void setCommunityId(String communityId) { this.communityId = communityId; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

public Set<String> getLikedBy() {
    return likedBy;
}

public void setLikedBy(Set<String> likedBy) {
    this.likedBy = likedBy;
}

 // Add getters and setters
    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }




}