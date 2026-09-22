package com.campushub.backend.controller;

import com.campushub.backend.dto.ClubMemberResponse;
import com.campushub.backend.service.ClubMemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
public class ClubMemberController {

    private final ClubMemberService clubMemberService;

    public ClubMemberController(ClubMemberService clubMemberService) {
        this.clubMemberService = clubMemberService;
    }

    @PostMapping("/api/clubs/{clubId}/join")
    public ResponseEntity<ClubMemberResponse> joinClub(@PathVariable Long clubId,
                                                       Principal principal) {
        ClubMemberResponse response = clubMemberService.joinClub(clubId, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/api/clubs/{clubId}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> leaveClub(@PathVariable Long clubId,
                                          Principal principal) {
        clubMemberService.leaveClub(clubId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/clubs/{clubId}/members")
    public ResponseEntity<List<ClubMemberResponse>> getClubMembers(@PathVariable Long clubId) {
        return ResponseEntity.ok(clubMemberService.getClubMembers(clubId));
    }

    @GetMapping("/api/users/me/clubs")
    public ResponseEntity<List<ClubMemberResponse>> getMyMemberships(Principal principal) {
        return ResponseEntity.ok(clubMemberService.getMyMemberships(principal.getName()));
    }

    @GetMapping("/api/clubs/{clubId}/membership")
    public ResponseEntity<Map<String, Boolean>> isMember(@PathVariable Long clubId,
                                                         Principal principal) {
        boolean member = clubMemberService.isMember(clubId, principal.getName());
        return ResponseEntity.ok(Map.of("isMember", member));
    }
}
