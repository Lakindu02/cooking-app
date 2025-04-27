package com.example.backend.repository;

import com.example.backend.model.FoodCommunity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodCommunityRepository extends MongoRepository<FoodCommunity, String> {
}
