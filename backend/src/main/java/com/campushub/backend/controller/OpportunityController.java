package com.campushub.backend.controller;

import com.campushub.backend.dto.OpportunityRequest;
import com.campushub.backend.dto.OpportunityResponse;
import com.campushub.backend.service.OpportunityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/opportunities")
public class OpportunityController {

    private final OpportunityService opportunityService;

    public OpportunityController(OpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @PostMapping
    public ResponseEntity<OpportunityResponse> createOpportunity(@Valid @RequestBody OpportunityRequest request,
                                                                 Principal principal) {
        OpportunityResponse response = opportunityService.createOpportunity(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<OpportunityResponse>> getAllOpportunities() {
        return ResponseEntity.ok(opportunityService.getAllOpportunities());
    }

    @GetMapping("/active")
    public ResponseEntity<List<OpportunityResponse>> getActiveOpportunities() {
        return ResponseEntity.ok(opportunityService.getActiveOpportunities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OpportunityResponse> getOpportunityById(@PathVariable Long id) {
        return ResponseEntity.ok(opportunityService.getOpportunityById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OpportunityResponse> updateOpportunity(@PathVariable Long id,
                                                                 @Valid @RequestBody OpportunityRequest request,
                                                                 Principal principal) {
        OpportunityResponse response = opportunityService.updateOpportunity(id, request, principal.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteOpportunity(@PathVariable Long id,
                                                  Principal principal) {
        opportunityService.deleteOpportunity(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
