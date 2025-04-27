package com.example.backend.service;

import com.example.backend.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {

    private final String SECRET_KEY = "MyNameIsSarith";  // Use a stronger key in production

    // Generate JWT Token
    public String generateToken(User user) {
        // Log the user details to confirm data is passed correctly
        System.out.println("Generating token for user: " + user.getEmail());
    
        // Token generation
        String token = Jwts.builder()
                .setSubject(user.getEmail())  // Set email as subject
                .claim("username", user.getUsername())  // Set username as claim
                .setIssuedAt(new Date())  // Set the issued at date
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))  // Set the expiration date (1 day)
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)  // Sign with HS256 and secret key
                .compact();  // Return the generated token
    
        // Log the generated token (for debugging purposes)
        System.out.println("Generated Token: " + token);  // Log the token for debugging
        
        return token;
    }
    
    // Extract email from JWT Token
    public String extractEmail(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();  // Extract the subject (email) from the token
    }
}
