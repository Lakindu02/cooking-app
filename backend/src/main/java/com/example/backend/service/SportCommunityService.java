package com.example.backend.service;

import com.example.backend.model.SportCommunity;
import com.example.backend.repository.SportCommunityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SportCommunityService {

    @Autowired
    private SportCommunityRepository sportCommunityRepository;

    public SportCommunity createCommunity(SportCommunity community) {
        return sportCommunityRepository.save(community);
    }

    public List<SportCommunity> getAllCommunities() {
        return sportCommunityRepository.findAll();
    }

    public Optional<SportCommunity> getCommunityById(String id) {
        return sportCommunityRepository.findById(id);
    }

    public SportCommunity joinCommunity(String id, String userName) {
        Optional<SportCommunity> optionalCommunity = sportCommunityRepository.findById(id);
        if (optionalCommunity.isPresent()) {
            SportCommunity community = optionalCommunity.get();
            if (!community.getMembers().contains(userName)) {
                community.getMembers().add(userName);
                return sportCommunityRepository.save(community);
            }
            return community; // Already a member
        }
        throw new RuntimeException("Community not found");
    }

    public SportCommunity leaveCommunity(String id, String userName) {
        Optional<SportCommunity> optionalCommunity = sportCommunityRepository.findById(id);
        if (optionalCommunity.isPresent()) {
            SportCommunity community = optionalCommunity.get();
            if (community.getMembers().contains(userName)) {
                community.getMembers().remove(userName);
                return sportCommunityRepository.save(community);
            }
            throw new RuntimeException("User not a member");
        }
        throw new RuntimeException("Community not found");
    }

    public List<SportCommunity> getCommunitiesByUser(String userName) {
        // Extract first name if space exists
        String firstName = userName.contains(" ") ? userName.split(" ")[0] : userName;
        return sportCommunityRepository.findByMembersContaining(firstName);
    }

    // Update community details
    public SportCommunity updateCommunity(String id, SportCommunity updatedCommunity) {
        Optional<SportCommunity> optionalCommunity = sportCommunityRepository.findById(id);
        if (optionalCommunity.isPresent()) {
            SportCommunity community = optionalCommunity.get();
            community.setName(updatedCommunity.getName());
            community.setDescription(updatedCommunity.getDescription());
            return sportCommunityRepository.save(community);
        }
        return null;
    }

    // Delete a community
    public boolean deleteCommunity(String id) {
        Optional<SportCommunity> optionalCommunity = sportCommunityRepository.findById(id);
        if (optionalCommunity.isPresent()) {
            @SuppressWarnings("unused")
            SportCommunity community = optionalCommunity.get();
            sportCommunityRepository.deleteById(id);
            return true;
        }
        return false;
    }

}
