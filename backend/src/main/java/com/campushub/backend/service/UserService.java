package com.campushub.backend.service;

import com.campushub.backend.dto.RegisterRequest;
import com.campushub.backend.dto.UserResponse;
import com.campushub.backend.dto.UserUpdateRequest;
import com.campushub.backend.entity.User;
import com.campushub.backend.exception.DuplicateResourceException;
import com.campushub.backend.exception.ResourceNotFoundException;
import com.campushub.backend.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ClubMemberRepository clubMemberRepository;
    private final EventRsvpRepository eventRsvpRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamJoinRequestRepository teamJoinRequestRepository;

    public UserService(UserRepository userRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       ClubMemberRepository clubMemberRepository,
                       EventRsvpRepository eventRsvpRepository,
                       TeamMemberRepository teamMemberRepository,
                       TeamJoinRequestRepository teamJoinRequestRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.clubMemberRepository = clubMemberRepository;
        this.eventRsvpRepository = eventRsvpRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.teamJoinRequestRepository = teamJoinRequestRepository;
    }

    @Transactional
    public UserResponse registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProgram(request.getProgram());
        user.setBranch(request.getBranch());
        user.setYear(request.getYear());
        user.setBio(request.getBio());
        user.setRole("STUDENT");

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    @Transactional
    public User saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public UserResponse getUserResponseById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToUserResponse(user);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request, String principalEmail) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        User currentUser = userRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + principalEmail));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
        boolean isOwner = currentUser.getId().equals(existingUser.getId()) || currentUser.getEmail().equalsIgnoreCase(existingUser.getEmail());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You do not have permission to update this user profile");
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            existingUser.setFullName(request.getFullName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank() && !request.getEmail().equalsIgnoreCase(existingUser.getEmail())) {
            if (userRepository.findByEmail(request.getEmail().trim()).isPresent()) {
                throw new DuplicateResourceException("Email already exists: " + request.getEmail().trim());
            }
            existingUser.setEmail(request.getEmail().trim());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getProgram() != null) {
            existingUser.setProgram(request.getProgram());
        }
        if (request.getBranch() != null) {
            existingUser.setBranch(request.getBranch());
        }
        if (request.getYear() != null) {
            existingUser.setYear(request.getYear());
        }
        if (request.getBio() != null) {
            existingUser.setBio(request.getBio());
        }

        User savedUser = userRepository.save(existingUser);
        return mapToUserResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUser(Long id, User updatedUser) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (updatedUser.getFullName() != null) {
            existingUser.setFullName(updatedUser.getFullName());
        }
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().equalsIgnoreCase(existingUser.getEmail())) {
            if (userRepository.findByEmail(updatedUser.getEmail()).isPresent()) {
                throw new DuplicateResourceException("Email already exists: " + updatedUser.getEmail());
            }
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        if (updatedUser.getProgram() != null) {
            existingUser.setProgram(updatedUser.getProgram());
        }
        if (updatedUser.getBranch() != null) {
            existingUser.setBranch(updatedUser.getBranch());
        }
        if (updatedUser.getYear() != null) {
            existingUser.setYear(updatedUser.getYear());
        }
        if (updatedUser.getBio() != null) {
            existingUser.setBio(updatedUser.getBio());
        }

        User savedUser = userRepository.save(existingUser);
        return mapToUserResponse(savedUser);
    }

    public List<UserResponse> getUsers(String search, String role) {
        List<User> users;
        boolean hasSearch = search != null && !search.isBlank();
        boolean hasRole = role != null && !role.isBlank();

        if (hasSearch && hasRole) {
            String term = search.trim();
            String r = role.trim().toUpperCase();
            users = userRepository.findByRoleAndFullNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
                    r, term, r, term
            );
        } else if (hasSearch) {
            String term = search.trim();
            users = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(term, term);
        } else if (hasRole) {
            users = userRepository.findByRole(role.trim().toUpperCase());
        } else {
            users = userRepository.findAll();
        }

        return users.stream().map(this::mapToUserResponse).toList();
    }

    @Transactional
    public UserResponse updateUserRole(Long id, String newRole) {
        if (newRole == null || newRole.isBlank()) {
            throw new IllegalArgumentException("Role cannot be empty");
        }
        String normalizedRole = newRole.trim().toUpperCase();
        if (!"ADMIN".equals(normalizedRole) && !"STUDENT".equals(normalizedRole)) {
            throw new IllegalArgumentException("Invalid role: " + newRole + ". Must be STUDENT or ADMIN");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Safeguard: Prevent accidental removal of the last administrator
        if ("ADMIN".equalsIgnoreCase(user.getRole()) && !"ADMIN".equals(normalizedRole)) {
            long adminCount = userRepository.countByRole("ADMIN");
            if (adminCount <= 1) {
                throw new IllegalStateException("Cannot remove the last remaining administrator");
            }
        }

        user.setRole(normalizedRole);
        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    @Transactional
    public void deleteUser(Long id, String principalEmail) {
        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        User currentUser = userRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + principalEmail));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
        boolean isOwner = currentUser.getId().equals(userToDelete.getId()) || currentUser.getEmail().equalsIgnoreCase(userToDelete.getEmail());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You do not have permission to delete this user");
        }

        // Safeguard: Prevent deleting the last administrator
        if ("ADMIN".equalsIgnoreCase(userToDelete.getRole())) {
            long adminCount = userRepository.countByRole("ADMIN");
            if (adminCount <= 1) {
                throw new IllegalStateException("Cannot delete the last remaining administrator");
            }
        }

        // Clean up user memberships and requests
        clubMemberRepository.deleteByUserId(id);
        eventRsvpRepository.deleteByUserId(id);
        teamMemberRepository.deleteByUserId(id);
        teamJoinRequestRepository.deleteByUserId(id);

        userRepository.delete(userToDelete);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            long adminCount = userRepository.countByRole("ADMIN");
            if (adminCount <= 1) {
                throw new IllegalStateException("Cannot delete the last remaining administrator");
            }
        }

        clubMemberRepository.deleteByUserId(id);
        eventRsvpRepository.deleteByUserId(id);
        teamMemberRepository.deleteByUserId(id);
        teamJoinRequestRepository.deleteByUserId(id);

        userRepository.delete(user);
    }

    public UserResponse mapToUserResponse(User user) {
        if (user == null) {
            return null;
        }
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setProgram(user.getProgram());
        response.setBranch(user.getBranch());
        response.setYear(user.getYear());
        response.setBio(user.getBio());
        response.setRole(user.getRole());
        return response;
    }
}
