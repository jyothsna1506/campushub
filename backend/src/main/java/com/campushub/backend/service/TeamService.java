package com.campushub.backend.service;

import com.campushub.backend.dto.TeamRequest;
import com.campushub.backend.dto.TeamResponse;
import com.campushub.backend.entity.Team;
import com.campushub.backend.entity.TeamMember;
import com.campushub.backend.entity.User;
import com.campushub.backend.exception.ResourceNotFoundException;
import com.campushub.backend.repository.TeamJoinRequestRepository;
import com.campushub.backend.repository.TeamMemberRepository;
import com.campushub.backend.repository.TeamRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamJoinRequestRepository teamJoinRequestRepository;
    private final UserRepository userRepository;

    public TeamService(TeamRepository teamRepository,
                       TeamMemberRepository teamMemberRepository,
                       TeamJoinRequestRepository teamJoinRequestRepository,
                       UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.teamJoinRequestRepository = teamJoinRequestRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TeamResponse createTeam(TeamRequest request, String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setCategory(request.getCategory());
        team.setOwner(owner);
        team.setOpenForMembers(request.getOpenForMembers() == null || request.getOpenForMembers());

        Team savedTeam = teamRepository.save(team);

        // Team owner automatically becomes a team member
        TeamMember ownerMember = new TeamMember(owner, savedTeam);
        teamMemberRepository.save(ownerMember);

        return mapToResponse(savedTeam);
    }

    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<TeamResponse> getOpenTeams() {
        return teamRepository.findByOpenForMembersTrue().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TeamResponse getTeamById(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
        return mapToResponse(team);
    }

    public List<TeamResponse> getMyTeams(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return teamRepository.findByOwnerId(user.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public TeamResponse updateTeam(Long id, TeamRequest request, String userEmail) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));

        if (!team.getOwner().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Only the team owner can update team details");
        }

        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setCategory(request.getCategory());
        if (request.getOpenForMembers() != null) {
            team.setOpenForMembers(request.getOpenForMembers());
        }

        Team updatedTeam = teamRepository.save(team);
        return mapToResponse(updatedTeam);
    }

    @Transactional
    public void deleteTeam(Long id, String userEmail) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));

        if (!team.getOwner().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Only the team owner can delete this team");
        }

        teamJoinRequestRepository.deleteByTeamId(id);
        teamMemberRepository.deleteByTeamId(id);
        teamRepository.delete(team);
    }

    @Transactional
    public void adminDeleteTeam(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));

        teamJoinRequestRepository.deleteByTeamId(id);
        teamMemberRepository.deleteByTeamId(id);
        teamRepository.delete(team);
    }

    public TeamResponse mapToResponse(Team team) {
        if (team == null) {
            return null;
        }
        return new TeamResponse(
                team.getId(),
                team.getName(),
                team.getDescription(),
                team.getCategory(),
                team.getOwner().getId(),
                team.getOwner().getFullName(),
                team.getCreatedAt(),
                team.isOpenForMembers()
        );
    }
}
