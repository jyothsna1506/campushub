package com.campushub.backend.service;

import com.campushub.backend.dto.RegisterRequest;
import com.campushub.backend.dto.UserResponse;
import com.campushub.backend.dto.UserUpdateRequest;
import com.campushub.backend.entity.College;
import com.campushub.backend.entity.User;
import com.campushub.backend.exception.DuplicateResourceException;
import com.campushub.backend.exception.ResourceNotFoundException;
import com.campushub.backend.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ClubMemberRepository clubMemberRepository;
    private final EventRsvpRepository eventRsvpRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamJoinRequestRepository teamJoinRequestRepository;
    private final CloudinaryService cloudinaryService;

    public UserService(UserRepository userRepository,
                       CollegeRepository collegeRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       ClubMemberRepository clubMemberRepository,
                       EventRsvpRepository eventRsvpRepository,
                       TeamMemberRepository teamMemberRepository,
                       TeamJoinRequestRepository teamJoinRequestRepository,
                       CloudinaryService cloudinaryService) {
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
        this.passwordEncoder = passwordEncoder;
        this.clubMemberRepository = clubMemberRepository;
        this.eventRsvpRepository = eventRsvpRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.teamJoinRequestRepository = teamJoinRequestRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @Transactional
    public UserResponse registerUser(RegisterRequest request) {
        if (request.getCollegeId() == null) {
            throw new IllegalArgumentException("College selection is required");
        }

        College college = collegeRepository.findById(request.getCollegeId())
                .orElseThrow(() -> new ResourceNotFoundException("College not found with id: " + request.getCollegeId()));

        if (!college.isActive()) {
            throw new IllegalArgumentException("Selected college is not active");
        }

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
        user.setCollege(college);

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

    public UserResponse getUserResponseById(Long id, String principalEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (principalEmail != null) {
            User current = userRepository.findByEmail(principalEmail).orElse(null);
            if (current != null && current.getCollege() != null && user.getCollege() != null) {
                if (!current.getCollege().getId().equals(user.getCollege().getId())) {
                    throw new ResourceNotFoundException("User not found with id: " + id);
                }
            }
        }

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

        // Cross-college access check for admin
        if (isAdmin && !isOwner && currentUser.getCollege() != null && existingUser.getCollege() != null) {
            if (!currentUser.getCollege().getId().equals(existingUser.getCollege().getId())) {
                throw new AccessDeniedException("Admins can only update users from their own college");
            }
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

        // College is IMMUTABLE and cannot be modified here
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

    public List<UserResponse> getUsers(String search, String role, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + adminEmail));

        Long adminCollegeId = admin.getCollege() != null ? admin.getCollege().getId() : null;

        List<UserResponse> allUsers = getUsers(search, role);
        if (adminCollegeId == null) {
            return allUsers;
        }

        return allUsers.stream()
                .filter(u -> adminCollegeId.equals(u.getCollegeId()))
                .toList();
    }

    @Transactional
    public UserResponse updateUserRole(Long id, String newRole) {
        return updateUserRole(id, newRole, null);
    }

    @Transactional
    public UserResponse updateUserRole(Long id, String newRole, String adminEmail) {
        if (newRole == null || newRole.isBlank()) {
            throw new IllegalArgumentException("Role cannot be empty");
        }
        String normalizedRole = newRole.trim().toUpperCase();
        if (!"ADMIN".equals(normalizedRole) && !"STUDENT".equals(normalizedRole)) {
            throw new IllegalArgumentException("Invalid role: " + newRole + ". Must be STUDENT or ADMIN");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        Long collegeId = user.getCollege() != null ? user.getCollege().getId() : null;

        if (adminEmail != null) {
            User admin = userRepository.findByEmail(adminEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + adminEmail));
            if (admin.getCollege() != null && collegeId != null && !admin.getCollege().getId().equals(collegeId)) {
                throw new ResourceNotFoundException("User not found with id: " + id);
            }
        }

        // Safeguard: Prevent accidental removal of the last administrator for the college
        if ("ADMIN".equalsIgnoreCase(user.getRole()) && !"ADMIN".equals(normalizedRole)) {
            if (collegeId != null) {
                long adminCount = userRepository.countByCollegeIdAndRole(collegeId, "ADMIN");
                if (adminCount <= 1) {
                    throw new IllegalStateException("Cannot remove the last remaining administrator for this college");
                }
            } else {
                long adminCount = userRepository.countByRole("ADMIN");
                if (adminCount <= 1) {
                    throw new IllegalStateException("Cannot remove the last remaining administrator");
                }
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

        // Admin cannot delete users from another college
        if (isAdmin && !isOwner && currentUser.getCollege() != null && userToDelete.getCollege() != null) {
            if (!currentUser.getCollege().getId().equals(userToDelete.getCollege().getId())) {
                throw new AccessDeniedException("Admins can only delete users from their own college");
            }
        }

        // Safeguard: Prevent deleting the last administrator
        if ("ADMIN".equalsIgnoreCase(userToDelete.getRole())) {
            Long collegeId = userToDelete.getCollege() != null ? userToDelete.getCollege().getId() : null;
            if (collegeId != null) {
                long adminCount = userRepository.countByCollegeIdAndRole(collegeId, "ADMIN");
                if (adminCount <= 1) {
                    throw new IllegalStateException("Cannot delete the last remaining administrator for this college");
                }
            } else {
                long adminCount = userRepository.countByRole("ADMIN");
                if (adminCount <= 1) {
                    throw new IllegalStateException("Cannot delete the last remaining administrator");
                }
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
    public UserResponse uploadProfileImage(String principalEmail, MultipartFile file) throws IOException {
        User user = userRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + principalEmail));

        if (user.getProfileImagePublicId() != null) {
            cloudinaryService.deleteImage(user.getProfileImagePublicId());
        }

        Map<String, String> uploadResult = cloudinaryService.uploadImage(file);
        user.setProfileImageUrl(uploadResult.get("url"));
        user.setProfileImagePublicId(uploadResult.get("publicId"));

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    @Transactional
    public UserResponse deleteProfileImage(String principalEmail) {
        User user = userRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + principalEmail));

        if (user.getProfileImagePublicId() != null) {
            cloudinaryService.deleteImage(user.getProfileImagePublicId());
        }

        user.setProfileImageUrl(null);
        user.setProfileImagePublicId(null);

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
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
        if (user.getCollege() != null) {
            response.setCollegeId(user.getCollege().getId());
            response.setCollegeName(user.getCollege().getName());
            response.setCollegeCode(user.getCollege().getCode());
        }
        response.setProfileImageUrl(user.getProfileImageUrl());
        return response;
    }
}
