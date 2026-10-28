package com.college.cms.service.impl;

import com.college.cms.dto.JwtAuthResponse;
import com.college.cms.dto.LoginDto;
import com.college.cms.entity.User;
import com.college.cms.exception.ApiException;
import com.college.cms.repository.UserRepository;
import com.college.cms.security.JwtTokenProvider;
import com.college.cms.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                            UserRepository userRepository,
                            JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public JwtAuthResponse login(LoginDto loginDto) {
        try {
            // 1. Authenticate username and password using Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getUsernameOrEmail(),
                            loginDto.getPassword()
                    )
            );

            // 2. Set authentication in Spring Security Context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 3. Generate JWT Token
            String token = jwtTokenProvider.generateToken(authentication);

            // 4. Retrieve User Details to find Role
            User user = userRepository.findByUsername(authentication.getName())
                    .or(() -> {
                        return userRepository.findAll().stream()
                                .filter(u -> u.getEmail().equalsIgnoreCase(loginDto.getUsernameOrEmail()))
                                .findFirst();
                    })
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User details not found."));

            // 5. Build and return JwtAuthResponse
            JwtAuthResponse response = new JwtAuthResponse();
            response.setAccessToken(token);
            response.setId(user.getId());
            response.setUsername(user.getUsername());
            response.setRole(user.getRole().name());

            return response;

        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid username/email or password: " + e.getMessage());
        }
    }
}
