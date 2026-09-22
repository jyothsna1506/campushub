package com.campushub.backend.controller;

import com.campushub.backend.dto.TeamRequest;
import com.campushub.backend.dto.TeamResponse;
import com.campushub.backend.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping("/api/teams")
    public ResponseEntity<TeamResponse> createTeam(@Valid @RequestBody TeamRequest request,
                                                   Principal principal) {
        TeamResponse response = teamService.createTeam(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/teams")
    public ResponseEntity<List<TeamResponse>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @GetMapping("/api/teams/open")
    public ResponseEntity<List<TeamResponse>> getOpenTeams() {
        return ResponseEntity.ok(teamService.getOpenTeams());
    }

    @GetMapping("/api/teams/{id}")
    public ResponseEntity<TeamResponse> getTeamById(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @GetMapping("/api/users/me/teams")
    public ResponseEntity<List<TeamResponse>> getMyTeams(Principal principal) {
        return ResponseEntity.ok(teamService.getMyTeams(principal.getName()));
    }

    @PutMapping("/api/teams/{id}")
    public ResponseEntity<TeamResponse> updateTeam(@PathVariable Long id,
                                                   @Valid @RequestBody TeamRequest request,
                                                   Principal principal) {
        TeamResponse response = teamService.updateTeam(id, request, principal.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/teams/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id,
                                           Principal principal) {
        teamService.deleteTeam(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
