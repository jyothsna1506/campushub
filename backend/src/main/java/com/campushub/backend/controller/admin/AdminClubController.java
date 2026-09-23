package com.campushub.backend.controller.admin;

import com.campushub.backend.dto.ClubRequest;
import com.campushub.backend.dto.ClubResponse;
import com.campushub.backend.service.ClubService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/clubs")
public class AdminClubController {

    private final ClubService clubService;

    public AdminClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @GetMapping
    public List<ClubResponse> getAllClubs() {
        return clubService.getAllClubs();
    }

    @GetMapping("/{id}")
    public ClubResponse getClubById(@PathVariable Long id) {
        return clubService.getClubById(id);
    }

    @PostMapping
    public ClubResponse createClub(@Valid @RequestBody ClubRequest request) {
        return clubService.createClub(request);
    }

    @PutMapping("/{id}")
    public ClubResponse updateClub(@PathVariable Long id, @Valid @RequestBody ClubRequest request) {
        return clubService.updateClub(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteClub(@PathVariable Long id) {
        clubService.deleteClub(id);
    }
}
