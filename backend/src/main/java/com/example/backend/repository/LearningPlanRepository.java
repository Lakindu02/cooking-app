package com.example.backend.repository;

import com.example.backend.model.LearningPlan;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {
    // You can add custom query methods here if needed
}
