package com.staffly.payroll_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 🔥 OPTIONS bypass
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();

        // permitAll payroll uçları: Bearer başlığını hiç işleme (403 / yanlış secret karmaşası olmasın)
        if (path.startsWith("/api/v1/payrolls")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 🔥 SWAGGER TAM BYPASS (EN ÖNEMLİ FIX)
        if (
                path.contains("swagger") ||
                        path.contains("api-docs")
        ) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);

        try {
            String userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userEmail,
                                null,
                                null
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

        } catch (Exception e) {
            // İmza/secret uyuşmazlığı veya süresi dolmuş token: 401 dönme.
            // permitAll uçları ve hatalı token ile bile istek controller'a ulaşabilsin.
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}