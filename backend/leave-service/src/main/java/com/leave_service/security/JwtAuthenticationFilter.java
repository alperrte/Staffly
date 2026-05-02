package com.leave_service.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Header yoksa geç
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        // Token geçersizse 401
        if (!jwtService.isTokenValid(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // 🔥 USER'I AUTHENTICATE ET
        Claims claims = jwtService.extractAllClaims(token);
        String email = claims.getSubject();

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        Collections.emptyList() // şimdilik role yok
                );

        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }
}