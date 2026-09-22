package com.campushub.backend.service;

import com.campushub.backend.dto.TeamJoinRequestResponse;
import com.campushub.backend.dto.TeamMemberResponse;
import com.campushub.backend.entity.Team;
import com.campushub.backend.entity.TeamJoinRequest;
import com.campushub.backend.entity.TeamJoinRequestStatus;
import com.campushub.backend.entity.TeamMember;
import com.campushub.backend.entity.User;
import com.campushub.backend.exception.DuplicateResourceException;
import com.campushub.backend.exception.ResourceNotFoundException;
import com.campushub.backend.repository.TeamJoinRequestRepository;
import com.campushub.backend.repository.TeamMemberRepository;
import com.campushub.backend.repository.TeamRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TeamJoinRequestService {

    private final TeamJoinRequestRepository teamJoinRequestRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public TeamJoinRequestService(TeamJoinRequestRepository teamJoinRequestRepository,
                                  TeamMemberRepository teamMemberRepository,
                                  TeamRepository teamRepository,
                                  UserRepository userRepository) {
        this.teamJoinRequestRepository = teamJoinRequestRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TeamJoinRequestResponse requestToJoin(Long teamId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        if (!team.isOpenForMembers()) {
            throw new DuplicateResourceException("Team is not currently open for new members");
        }

        if (team.getOwner().getId().equals(user.getId())) {
            throw new DuplicateResourceException("You are already the owner of this team");
        }

        if (teamMemberRepository.existsByUserIdAndTeamId(user.getId(), teamId)) {
            throw new DuplicateResourceException("You are already a member of this team");
        }

        if (teamJoinRequestRepository.existsByUserIdAndTeamIdAndStatus(user.getId(), teamId, TeamJoinRequestStatus.PENDING)) {
            throw new DuplicateResourceException("You already have a pending join request for this team");
        }

        TeamJoinRequest request = new TeamJoinRequest(user, team);
        TeamJoinRequest savedRequest = teamJoinRequestRepository.save(request);
        return mapToResponse(savedRequest);
    }

    @Transactional
    public void cancelMyRequest(Long requestId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        TeamJoinRequest request = teamJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found with id: " + requestId));

        if (!request.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only cancel your own join request");
        }

        if (request.getStatus() != TeamJoinRequestStatus.PENDING) {
            throw new DuplicateResourceException("Cannot cancel a request that has already been " + request.getStatus());
        }

        teamJoinRequestRepository.delete(request);
    }

    public List<TeamJoinRequestResponse> getTeamJoinRequests(Long teamId, String userEmail) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        if (!team.getOwner().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Only the team owner can view join requests for this team");
        }

        return teamJoinRequestRepository.findByTeamId(teamId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public TeamJoinRequestResponse acceptJoinRequest(Long requestId, String userEmail) {
        TeamJoinRequest request = teamJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found with id: " + requestId));

        if (!request.getTeam().getOwner().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Only the team owner can accept join requests");
        }

        if (request.getStatus() != TeamJoinRequestStatus.PENDING) {
            throw new DuplicateResourceException("Request has already been processed: " + request.getStatus());
        }

        if (!teamMemberRepository.existsByUserIdAndTeamId(request.getUser().getId(), request.getTeam().getId())) {
            TeamMember newMember = new TeamMember(request.getUser(), request.getTeam());
            teamMemberRepository.save(newMember);
        }

        request.setStatus(TeamJoinRequestStatus.ACCEPTED);
        request.setRespondedAt(LocalDateTime.now());

        TeamJoinRequest updatedRequest = teamJoinRequestRepository.save(request);
        return mapToResponse(updatedRequest);
    }

    @Transactional
    public TeamJoinRequestResponse rejectJoinRequest(Long requestId, String userEmail) {
        TeamJoinRequest request = teamJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found with id: " + requestId));

        if (!request.getTeam().getOwner().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Only the team owner can reject join requests");
        }

        if (request.getStatus() != TeamJoinRequestStatus.PENDING) {
            throw new DuplicateResourceException("Request has already been processed: " + request.getStatus());
        }

        request.setStatus(TeamJoinRequestStatus.REJECTED);
        request.setRespondedAt(LocalDateTime.now());

        TeamJoinRequest updatedRequest = teamJoinRequestRepository.save(request);
        return mapToResponse(updatedRequest);
    }

    public List<TeamJoinRequestResponse> getMyJoinRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return teamJoinRequestRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<TeamMemberResponse> getTeamMembers(Long teamId) {
        if (!teamRepository.existsById(teamId)) {
            throw new ResourceNotFoundException("Team not found with id: " + teamId);
        }
        return teamMemberRepository.findByTeamId(teamId).stream()
                .map(this::mapToMemberResponse)
                .toList();
    }

    private TeamJoinRequestResponse mapToResponse(TeamJoinRequest request) {
        if (request == null) {
            return null;
        }
        return new TeamJoinRequestResponse(
                request.getId(),
                request.getUser().getId(),
                request.getUser().getFullName(),
                request.getTeam().getId(),
                request.getTeam().getName(),
                request.getStatus(),
                request.getRequestedAt(),
                request.getRespondedAt()
        );
    }

    private TeamMemberResponse mapToMemberResponse(TeamMember member) {
        if (member == null) {
            return null;
        }
        return new TeamMemberResponse(
                member.getId(),
                member.getUser().getId(),
                member.getUser().getFullName(),
                member.getTeam().getId(),
                member.getTeam().getName(),
                member.getJoinedAt()
        );
    }
}
