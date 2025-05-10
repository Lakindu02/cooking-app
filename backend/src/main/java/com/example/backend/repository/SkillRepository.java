package com.example.backend.repository;

import com.example.backend.model.Skill;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface SkillRepository extends MongoRepository<Skill, String> {

    // Get skills for a specific sport
    List<Skill> findBySport(String sport);

    // Get distinct sport names only
    @Query(value = "{}", fields = "{'sport' : 1, '_id' : 0}")
    List<String> findDistinctSports();

    // Alternative if you need the full documents
    @Query(value = "{}", fields = "{'sport' : 1}")
    List<Skill> findAllSports();
}