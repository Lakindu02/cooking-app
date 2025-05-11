package com.example.backend.service;

import com.example.backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final String SECRET_KEY = "MySuperSecretKeyForJwtTokenThatIsAtLeast32Bytes";  // Use a stronger key in production
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));

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
                .signWith(key)  // Sign with the key
                .compact();  // Return the generated token

        // Log the generated token (for debugging purposes)
        System.out.println("Generated Token: " + token);  // Log the token for debugging

        return token;
    }

    // Extract email from JWT Token
    public String extractEmail(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            // Check if token is expired
            if (claims.getExpiration().before(new Date())) {
                throw new ExpiredJwtException(null, claims, "Token has expired");
            }
            
            return claims.getSubject();  // Extract the subject (email) from the token
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("Token has expired");
        } catch (UnsupportedJwtException | MalformedJwtException | SignatureException e) {
            throw new RuntimeException("Invalid token");
        }
    }

    // Validate JWT Token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("Token has expired");
        } catch (UnsupportedJwtException | MalformedJwtException | SignatureException e) {
            throw new RuntimeException("Invalid token");
        }
    }
}