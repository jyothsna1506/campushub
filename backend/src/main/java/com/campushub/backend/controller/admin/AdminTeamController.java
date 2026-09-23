package com.campushub.backend.controller.admin;

import com.campushub.backend.dto.TeamJoinRequestResponse;
import com.campushub.backend.dto.TeamMemberResponse;
import com.campushub.backend.dto.TeamResponse;
import com.campushub.backend.service.TeamJoinRequestService;
import com.campushub.backend.service.TeamService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/teams")
public class AdminTeamController {

    private final TeamService teamService;
    private final TeamJoinRequestService teamJoinRequestService;

    public AdminTeamController(TeamService teamService, TeamJoinRequestService teamJoinRequestService) {
        this.teamService = teamService;
        this.teamJoinRequestService = teamJoinRequestService;
    }

    @GetMapping
    public List<TeamResponse> getAllTeams() {
        return teamService.getAllTeams();
    }

    @GetMapping("/{id}")
    public TeamResponse getTeamById(@PathVariable Long id) {
        return teamService.getTeamById(id);
    }

    @GetMapping("/{id}/members")
    public List<TeamMemberResponse> getTeamMembers(@PathVariable Long id) {
        return teamJoinRequestService.getTeamMembers(id);
    }

    @GetMapping("/{id}/requests")
    public List<TeamJoinRequestResponse> getTeamRequests(@PathVariable Long id) {
        return teamJoinRequestService.adminGetTeamRequests(id);
    }

    @DeleteMapping("/{id}")
    public void deleteTeam(@PathVariable Long id) {
        teamService.adminDeleteTeam(id);
    }
}
