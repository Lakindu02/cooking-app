package com.example.backend.service;

import com.example.backend.model.FoodCommunity;
import com.example.backend.repository.FoodCommunityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class FoodCommunityService {

    @Autowired
    private FoodCommunityRepository foodCommunityRepository;

    public FoodCommunity createCommunity(FoodCommunity community) {
        return foodCommunityRepository.save(community);
    }

    public List<FoodCommunity> getAllCommunities() {
        return foodCommunityRepository.findAll();
    }

    public Optional<FoodCommunity> getCommunityById(String id) {
        return foodCommunityRepository.findById(id);
    }

    public FoodCommunity joinCommunity(String id, String userName) {
        Optional<FoodCommunity> optionalCommunity = foodCommunityRepository.findById(id);
        if (optionalCommunity.isPresent()) {
            FoodCommunity community = optionalCommunity.get();
            if (!community.getMembers().contains(userName)) {
                community.getMembers().add(userName);
                return foodCommunityRepository.save(community);
            }
            return community; // Already a member
        }
        throw new RuntimeException("Community not found");
    }

    public FoodCommunity leaveCommunity(String id, String userName) {
        Optional<FoodCommunity> optionalCommunity = foodCommunityRepository.findById(id);
        if (optionalCommunity.isPresent()) {
            FoodCommunity community = optionalCommunity.get();
            if (community.getMembers().contains(userName)) {
                community.getMembers().remove(userName);
                return foodCommunityRepository.save(community);
            }
            throw new RuntimeException("User not a member");
        }
        throw new RuntimeException("Community not found");
    }

    public List<FoodCommunity> getCommunitiesByUser(String userName) {
        // Extract first name if space exists
        String firstName = userName.contains(" ") ? userName.split(" ")[0] : userName;
        return foodCommunityRepository.findByMembersContaining(firstName);
    }

    // Update community details
    public FoodCommunity updateCommunity(String id, FoodCommunity updatedCommunity) {
        Optional<FoodCommunity> optionalCommunity = foodCommunityRepository.findById(id);
        if (optionalCommunity.isPresent()) {
            FoodCommunity community = optionalCommunity.get();
            community.setName(updatedCommunity.getName());
            community.setDescription(updatedCommunity.getDescription());
            return foodCommunityRepository.save(community);
        }
        return null;
    }

    // Delete a community
    public boolean deleteCommunity(String id) {
        Optional<FoodCommunity> optionalCommunity = foodCommunityRepository.findById(id);
        if (optionalCommunity.isPresent()) {
            @SuppressWarnings("unused")
            FoodCommunity community = optionalCommunity.get();
            foodCommunityRepository.deleteById(id);
            return true;
        }
        return false;
    }

}
