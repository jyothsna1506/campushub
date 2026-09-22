package com.campushub.backend.controller;

import com.campushub.backend.dto.ClubRequest;
import com.campushub.backend.dto.ClubResponse;
import com.campushub.backend.service.ClubService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @PostMapping
    public ResponseEntity<ClubResponse> createClub(@Valid @RequestBody ClubRequest request) {
        ClubResponse response = clubService.createClub(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ClubResponse>> getAllClubs() {
        return ResponseEntity.ok(clubService.getAllClubs());
    }

    @GetMapping("/active")
    public ResponseEntity<List<ClubResponse>> getActiveClubs() {
        return ResponseEntity.ok(clubService.getActiveClubs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubResponse> getClubById(@PathVariable Long id) {
        return ResponseEntity.ok(clubService.getClubById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClubResponse> updateClub(@PathVariable Long id,
                                                   @Valid @RequestBody ClubRequest request) {
        return ResponseEntity.ok(clubService.updateClub(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteClub(@PathVariable Long id) {
        clubService.deleteClub(id);
        return ResponseEntity.noContent().build();
    }
}
