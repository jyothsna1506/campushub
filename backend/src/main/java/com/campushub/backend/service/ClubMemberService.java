package com.campushub.backend.service;

import com.campushub.backend.dto.ClubMemberResponse;
import com.campushub.backend.entity.Club;
import com.campushub.backend.entity.ClubMember;
import com.campushub.backend.entity.User;
import com.campushub.backend.exception.DuplicateResourceException;
import com.campushub.backend.exception.ResourceNotFoundException;
import com.campushub.backend.repository.ClubMemberRepository;
import com.campushub.backend.repository.ClubRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClubMemberService {

    private final ClubMemberRepository clubMemberRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;

    public ClubMemberService(ClubMemberRepository clubMemberRepository,
                             ClubRepository clubRepository,
                             UserRepository userRepository) {
        this.clubMemberRepository = clubMemberRepository;
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ClubMemberResponse joinClub(Long clubId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));

        if (clubMemberRepository.existsByUserAndClub(user, club)) {
            throw new DuplicateResourceException("User is already a member of club: " + club.getName());
        }

        ClubMember member = new ClubMember(user, club);
        ClubMember savedMember = clubMemberRepository.save(member);
        return mapToResponse(savedMember);
    }

    @Transactional
    public void leaveClub(Long clubId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));

        ClubMember membership = clubMemberRepository.findByUserAndClub(user, club)
                .orElseThrow(() -> new ResourceNotFoundException("You are not a member of club: " + club.getName()));

        clubMemberRepository.delete(membership);
    }

    public List<ClubMemberResponse> getClubMembers(Long clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new ResourceNotFoundException("Club not found with id: " + clubId);
        }
        return clubMemberRepository.findByClubId(clubId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ClubMemberResponse> getMyMemberships(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return clubMemberRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public boolean isMember(Long clubId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return clubMemberRepository.existsByUserIdAndClubId(user.getId(), clubId);
    }

    private ClubMemberResponse mapToResponse(ClubMember member) {
        if (member == null) {
            return null;
        }
        return new ClubMemberResponse(
                member.getId(),
                member.getUser().getId(),
                member.getUser().getFullName(),
                member.getClub().getId(),
                member.getClub().getName(),
                member.getJoinedAt()
        );
    }
}
