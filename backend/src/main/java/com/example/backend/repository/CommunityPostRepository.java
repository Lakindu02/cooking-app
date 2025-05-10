package com.example.backend.repository;

import com.example.backend.model.CommunityPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CommunityPostRepository extends MongoRepository<CommunityPost, String> {
    List<CommunityPost> findByCommunityId(String communityId);
}
