package com.example.backend.dto;

public class SkillDTO {
    private String sport;
    private String skillName;

    // Constructors
    public SkillDTO() {}

    public SkillDTO(String sport, String skillName) {
        this.sport = sport;
        this.skillName = skillName;
    }

    // Getters and Setters
    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }
}

