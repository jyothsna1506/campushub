package com.campushub.backend.controller.admin;

import com.campushub.backend.dto.OpportunityRequest;
import com.campushub.backend.dto.OpportunityResponse;
import com.campushub.backend.service.OpportunityService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/opportunities")
public class AdminOpportunityController {

    private final OpportunityService opportunityService;

    public AdminOpportunityController(OpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @GetMapping
    public List<OpportunityResponse> getAllOpportunities() {
        return opportunityService.getAllOpportunities();
    }

    @GetMapping("/{id}")
    public OpportunityResponse getOpportunityById(@PathVariable Long id) {
        return opportunityService.getOpportunityById(id);
    }

    @PostMapping
    public OpportunityResponse createOpportunity(@Valid @RequestBody OpportunityRequest request, Authentication authentication) {
        return opportunityService.createOpportunity(request, authentication.getName());
    }

    @PutMapping("/{id}")
    public OpportunityResponse updateOpportunity(@PathVariable Long id, @Valid @RequestBody OpportunityRequest request) {
        return opportunityService.adminUpdateOpportunity(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteOpportunity(@PathVariable Long id) {
        opportunityService.adminDeleteOpportunity(id);
    }
}
