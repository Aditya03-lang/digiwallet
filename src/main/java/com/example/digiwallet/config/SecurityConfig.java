package com.example.digiwallet.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Enable CORS — delegates to CorsConfig bean
                .cors(cors -> cors.configure(http))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/h2-console/**").permitAll()
                        .anyRequest().permitAll())
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.disable()));

        return http.build();
    }
}
