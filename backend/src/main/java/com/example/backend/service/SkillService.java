package com.example.backend.service;

import com.example.backend.model.Skill;
import com.example.backend.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillService {

    @Autowired
    private SkillRepository skillRepository;

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public Skill getSkillById(String id) {
        return skillRepository.findById(id).orElse(null);
    }

    public Skill addSkill(Skill skill) {
        return skillRepository.save(skill);
    }

    public void deleteSkill(String id) {
        skillRepository.deleteById(id);
    }
}
