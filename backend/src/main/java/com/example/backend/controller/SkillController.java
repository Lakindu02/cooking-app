package com.example.backend.controller;

import com.example.backend.model.Skill;
import com.example.backend.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    @Autowired
    private SkillService skillService;

    @GetMapping
    public List<Skill> getAllSkills() {
        return skillService.getAllSkills();
    }

    @GetMapping("/{id}")
    public Skill getSkillById(@PathVariable String id) {
        return skillService.getSkillById(id);
    }

    @PostMapping
    public Skill addSkill(@RequestBody Skill skill) {
        return skillService.addSkill(skill);
    }

    @DeleteMapping("/{id}")
    public void deleteSkill(@PathVariable String id) {
        skillService.deleteSkill(id);
    }
}
