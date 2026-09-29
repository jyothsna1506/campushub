package com.campushub.backend.controller.admin;

import com.campushub.backend.dto.ClubRequest;
import com.campushub.backend.dto.ClubResponse;
import com.campushub.backend.service.ClubService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/clubs")
public class AdminClubController {

    private final ClubService clubService;

    public AdminClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @GetMapping
    public List<ClubResponse> getAllClubs(Principal principal) {
        return clubService.getAllClubs(principal != null ? principal.getName() : null);
    }

    @GetMapping("/{id}")
    public ClubResponse getClubById(@PathVariable Long id, Principal principal) {
        return clubService.getClubById(id, principal != null ? principal.getName() : null);
    }

    @PostMapping
    public ClubResponse createClub(@Valid @RequestBody ClubRequest request, Principal principal) {
        return clubService.createClub(request, principal != null ? principal.getName() : null);
    }

    @PutMapping("/{id}")
    public ClubResponse updateClub(@PathVariable Long id, @Valid @RequestBody ClubRequest request, Principal principal) {
        return clubService.updateClub(id, request, principal != null ? principal.getName() : null);
    }

    @DeleteMapping("/{id}")
    public void deleteClub(@PathVariable Long id, Principal principal) {
        clubService.deleteClub(id, principal != null ? principal.getName() : null);
    }
}
