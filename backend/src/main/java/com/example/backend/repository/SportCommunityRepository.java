package com.example.backend.repository;

import com.example.backend.model.SportCommunity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SportCommunityRepository extends MongoRepository<SportCommunity, String> {
    List<SportCommunity> findByMembersContaining(String userName);
}
