package com.sih.blockplanning.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * JwtUtil provides standard HMAC-SHA256 JSON Web Token generation and validation
 * without external library dependencies.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret:9a3f8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private long expiration;

    public String generateToken(String username, String role) {
        long now = System.currentTimeMillis();
        long exp = now + expiration;

        String header = Base64.getUrlEncoder().withoutPadding()
                .encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String payloadJson = String.format("{\"sub\":\"%s\",\"role\":\"%s\",\"iat\":%d,\"exp\":%d}",
                username, role, now / 1000, exp / 1000);
        String payload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

        String signature = sign(header + "." + payload, secret);
        return header + "." + payload + "." + signature;
    }

    public String extractUsername(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            int subIndex = payload.indexOf("\"sub\":\"");
            if (subIndex != -1) {
                int start = subIndex + 7;
                int end = payload.indexOf("\"", start);
                return payload.substring(start, end);
            }
        } catch (Exception ignored) {}
        return null;
    }

    public boolean validateToken(String token, String username) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return false;
            String expectedSig = sign(parts[0] + "." + parts[1], secret);
            if (!expectedSig.equals(parts[2])) return false;
            String user = extractUsername(token);
            return (user != null && user.equals(username));
        } catch (Exception e) {
            return false;
        }
    }

    private String sign(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        } catch (Exception e) {
            throw new RuntimeException("Error signing JWT", e);
        }
    }
}
