package com.campushub.backend.controller;

import com.campushub.backend.dto.ClubRequest;
import com.campushub.backend.dto.ClubResponse;
import com.campushub.backend.service.ClubService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @PostMapping
    public ResponseEntity<ClubResponse> createClub(@Valid @RequestBody ClubRequest request, Principal principal) {
        String email = principal != null ? principal.getName() : null;
        ClubResponse response = clubService.createClub(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ClubResponse>> getAllClubs(Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(clubService.getAllClubs(email));
    }

    @GetMapping("/active")
    public ResponseEntity<List<ClubResponse>> getActiveClubs(Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(clubService.getActiveClubs(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubResponse> getClubById(@PathVariable Long id, Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(clubService.getClubById(id, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClubResponse> updateClub(@PathVariable Long id,
                                                   @Valid @RequestBody ClubRequest request,
                                                   Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(clubService.updateClub(id, request, email));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteClub(@PathVariable Long id, Principal principal) {
        String email = principal != null ? principal.getName() : null;
        clubService.deleteClub(id, email);
        return ResponseEntity.noContent().build();
    }
}
