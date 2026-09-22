package com.campushub.backend.controller;

import com.campushub.backend.dto.TeamJoinRequestResponse;
import com.campushub.backend.dto.TeamMemberResponse;
import com.campushub.backend.service.TeamJoinRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
public class TeamJoinRequestController {

    private final TeamJoinRequestService teamJoinRequestService;

    public TeamJoinRequestController(TeamJoinRequestService teamJoinRequestService) {
        this.teamJoinRequestService = teamJoinRequestService;
    }

    @PostMapping("/api/teams/{teamId}/join-requests")
    public ResponseEntity<TeamJoinRequestResponse> requestToJoin(@PathVariable Long teamId,
                                                                 Principal principal) {
        TeamJoinRequestResponse response = teamJoinRequestService.requestToJoin(teamId, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/api/teams/join-requests/{requestId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> cancelMyRequest(@PathVariable Long requestId,
                                                Principal principal) {
        teamJoinRequestService.cancelMyRequest(requestId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/teams/{teamId}/members")
    public ResponseEntity<List<TeamMemberResponse>> getTeamMembers(@PathVariable Long teamId) {
        return ResponseEntity.ok(teamJoinRequestService.getTeamMembers(teamId));
    }

    @GetMapping("/api/teams/{teamId}/join-requests")
    public ResponseEntity<List<TeamJoinRequestResponse>> getTeamJoinRequests(@PathVariable Long teamId,
                                                                             Principal principal) {
        return ResponseEntity.ok(teamJoinRequestService.getTeamJoinRequests(teamId, principal.getName()));
    }

    @GetMapping("/api/users/me/team-requests")
    public ResponseEntity<List<TeamJoinRequestResponse>> getMyJoinRequests(Principal principal) {
        return ResponseEntity.ok(teamJoinRequestService.getMyJoinRequests(principal.getName()));
    }

    @PutMapping("/api/teams/join-requests/{requestId}/accept")
    public ResponseEntity<TeamJoinRequestResponse> acceptJoinRequest(@PathVariable Long requestId,
                                                                     Principal principal) {
        TeamJoinRequestResponse response = teamJoinRequestService.acceptJoinRequest(requestId, principal.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/teams/join-requests/{requestId}/reject")
    public ResponseEntity<TeamJoinRequestResponse> rejectJoinRequest(@PathVariable Long requestId,
                                                                     Principal principal) {
        TeamJoinRequestResponse response = teamJoinRequestService.rejectJoinRequest(requestId, principal.getName());
        return ResponseEntity.ok(response);
    }
}
