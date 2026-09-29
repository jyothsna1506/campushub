package com.campushub.backend.service;

import com.campushub.backend.dto.OpportunityRequest;
import com.campushub.backend.dto.OpportunityResponse;
import com.campushub.backend.entity.Opportunity;
import com.campushub.backend.entity.User;
import com.campushub.backend.exception.ResourceNotFoundException;
import com.campushub.backend.repository.OpportunityRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final UserRepository userRepository;

    public OpportunityService(OpportunityRepository opportunityRepository, UserRepository userRepository) {
        this.opportunityRepository = opportunityRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OpportunityResponse createOpportunity(OpportunityRequest request, String userEmail) {
        validateDeadline(request.getApplicationDeadline());

        User poster = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Opportunity opportunity = new Opportunity();
        opportunity.setTitle(request.getTitle());
        opportunity.setDescription(request.getDescription());
        opportunity.setOrganization(request.getOrganization());
        opportunity.setType(request.getType());
        opportunity.setLocation(request.getLocation());
        opportunity.setApplicationUrl(request.getApplicationUrl());
        opportunity.setApplicationDeadline(request.getApplicationDeadline());
        opportunity.setPostedBy(poster);
        opportunity.setActive(true);
        if (poster.getCollege() != null) {
            opportunity.setCollege(poster.getCollege());
        }

        Opportunity savedOpportunity = opportunityRepository.save(opportunity);
        return mapToResponse(savedOpportunity);
    }

    public List<OpportunityResponse> getAllOpportunities() {
        return getAllOpportunities(null);
    }

    public List<OpportunityResponse> getAllOpportunities(String userEmail) {
        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null && user.getCollege() != null) {
                return opportunityRepository.findByCollegeIdOrderByApplicationDeadlineAsc(user.getCollege().getId()).stream()
                        .map(this::mapToResponse)
                        .toList();
            }
        }
        return opportunityRepository.findAllByOrderByApplicationDeadlineAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<OpportunityResponse> getActiveOpportunities() {
        return getActiveOpportunities(null);
    }

    public List<OpportunityResponse> getActiveOpportunities(String userEmail) {
        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null && user.getCollege() != null) {
                return opportunityRepository.findByCollegeIdAndActiveTrueOrderByApplicationDeadlineAsc(user.getCollege().getId()).stream()
                        .map(this::mapToResponse)
                        .toList();
            }
        }
        return opportunityRepository.findByActiveTrueOrderByApplicationDeadlineAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OpportunityResponse getOpportunityById(Long id) {
        return getOpportunityById(id, null);
    }

    public OpportunityResponse getOpportunityById(Long id, String userEmail) {
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + id));

        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null && user.getCollege() != null && opportunity.getCollege() != null) {
                if (!user.getCollege().getId().equals(opportunity.getCollege().getId())) {
                    throw new ResourceNotFoundException("Opportunity not found with id: " + id);
                }
            }
        }

        return mapToResponse(opportunity);
    }

    @Transactional
    public OpportunityResponse updateOpportunity(Long id, OpportunityRequest request, String userEmail) {
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + id));

        if (!opportunity.getPostedBy().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Only the original poster can update this opportunity");
        }

        if (request.getApplicationDeadline() != null) {
            validateDeadline(request.getApplicationDeadline());
            opportunity.setApplicationDeadline(request.getApplicationDeadline());
        }

        opportunity.setTitle(request.getTitle());
        opportunity.setDescription(request.getDescription());
        opportunity.setOrganization(request.getOrganization());
        opportunity.setType(request.getType());
        opportunity.setLocation(request.getLocation());
        opportunity.setApplicationUrl(request.getApplicationUrl());

        Opportunity updatedOpportunity = opportunityRepository.save(opportunity);
        return mapToResponse(updatedOpportunity);
    }

    @Transactional
    public void deleteOpportunity(Long id, String userEmail) {
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + id));

        if (!opportunity.getPostedBy().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Only the original poster can delete this opportunity");
        }

        opportunityRepository.delete(opportunity);
    }

    @Transactional
    public OpportunityResponse adminUpdateOpportunity(Long id, OpportunityRequest request) {
        return adminUpdateOpportunity(id, request, null);
    }

    @Transactional
    public OpportunityResponse adminUpdateOpportunity(Long id, OpportunityRequest request, String adminEmail) {
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + id));

        if (adminEmail != null) {
            User admin = userRepository.findByEmail(adminEmail).orElse(null);
            if (admin != null && admin.getCollege() != null && opportunity.getCollege() != null) {
                if (!admin.getCollege().getId().equals(opportunity.getCollege().getId())) {
                    throw new ResourceNotFoundException("Opportunity not found with id: " + id);
                }
            }
        }

        if (request.getApplicationDeadline() != null) {
            validateDeadline(request.getApplicationDeadline());
            opportunity.setApplicationDeadline(request.getApplicationDeadline());
        }

        opportunity.setTitle(request.getTitle());
        opportunity.setDescription(request.getDescription());
        opportunity.setOrganization(request.getOrganization());
        opportunity.setType(request.getType());
        opportunity.setLocation(request.getLocation());
        opportunity.setApplicationUrl(request.getApplicationUrl());

        Opportunity updatedOpportunity = opportunityRepository.save(opportunity);
        return mapToResponse(updatedOpportunity);
    }

    @Transactional
    public void adminDeleteOpportunity(Long id) {
        adminDeleteOpportunity(id, null);
    }

    @Transactional
    public void adminDeleteOpportunity(Long id, String adminEmail) {
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + id));

        if (adminEmail != null) {
            User admin = userRepository.findByEmail(adminEmail).orElse(null);
            if (admin != null && admin.getCollege() != null && opportunity.getCollege() != null) {
                if (!admin.getCollege().getId().equals(opportunity.getCollege().getId())) {
                    throw new ResourceNotFoundException("Opportunity not found with id: " + id);
                }
            }
        }

        opportunityRepository.delete(opportunity);
    }

    private void validateDeadline(LocalDate deadline) {
        if (deadline == null) {
            throw new IllegalArgumentException("Application deadline is required");
        }
        if (deadline.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Application deadline cannot be in the past");
        }
    }

    private OpportunityResponse mapToResponse(Opportunity opportunity) {
        if (opportunity == null) {
            return null;
        }
        return new OpportunityResponse(
                opportunity.getId(),
                opportunity.getTitle(),
                opportunity.getDescription(),
                opportunity.getOrganization(),
                opportunity.getType(),
                opportunity.getLocation(),
                opportunity.getApplicationUrl(),
                opportunity.getApplicationDeadline(),
                opportunity.getPostedBy().getId(),
                opportunity.getPostedBy().getFullName(),
                opportunity.getCreatedAt(),
                opportunity.isActive(),
                opportunity.getCollege() != null ? opportunity.getCollege().getId() : null,
                opportunity.getCollege() != null ? opportunity.getCollege().getName() : null
        );
    }
}
