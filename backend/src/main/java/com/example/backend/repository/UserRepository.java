package com.example.backend.repository;

import com.example.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    // Custom query method to find a user by email
    Optional<User> findByEmail(String email);

    // Custom query method to check if a user exists by email
    boolean existsByEmail(String email);

    // Custom query method to find a user by username
    Optional<User> findByUsername(String username);
}
