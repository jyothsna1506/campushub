package com.campushub.backend.service;

import com.campushub.backend.dto.AuthResponse;
import com.campushub.backend.dto.LoginRequest;
import com.campushub.backend.dto.UserResponse;
import com.campushub.backend.entity.User;
import com.campushub.backend.exception.ResourceNotFoundException;
import com.campushub.backend.repository.UserRepository;
import com.campushub.backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthenticationService(AuthenticationManager authenticationManager,
                                 UserRepository userRepository,
                                 JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid email or password"));

        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setFullName(user.getFullName());
        userResponse.setEmail(user.getEmail());
        userResponse.setProgram(user.getProgram());
        userResponse.setBranch(user.getBranch());
        userResponse.setYear(user.getYear());
        userResponse.setBio(user.getBio());
        userResponse.setRole(user.getRole());
        if (user.getCollege() != null) {
            userResponse.setCollegeId(user.getCollege().getId());
            userResponse.setCollegeName(user.getCollege().getName());
            userResponse.setCollegeCode(user.getCollege().getCode());
        }
        userResponse.setProfileImageUrl(user.getProfileImageUrl());

        String role = user.getRole() != null ? user.getRole() : "STUDENT";
        Long collegeId = user.getCollege() != null ? user.getCollege().getId() : 0L;
        String token = jwtService.generateToken(Map.of("role", role, "collegeId", collegeId), user.getEmail());

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setType("Bearer");
        response.setUser(userResponse);

        return response;
    }
}
