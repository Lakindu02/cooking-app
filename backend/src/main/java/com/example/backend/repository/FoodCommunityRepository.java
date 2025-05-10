package com.example.backend.repository;

import com.example.backend.model.FoodCommunity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodCommunityRepository extends MongoRepository<FoodCommunity, String> {
    List<FoodCommunity> findByMembersContaining(String userName);
}
