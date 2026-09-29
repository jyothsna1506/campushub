package com.campushub.backend.service;

import com.campushub.backend.dto.ClubRequest;
import com.campushub.backend.dto.ClubResponse;
import com.campushub.backend.entity.Club;
import com.campushub.backend.entity.College;
import com.campushub.backend.entity.User;
import com.campushub.backend.exception.ResourceNotFoundException;
import com.campushub.backend.repository.ClubMemberRepository;
import com.campushub.backend.repository.ClubRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClubService {

    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final UserRepository userRepository;

    public ClubService(ClubRepository clubRepository,
                       ClubMemberRepository clubMemberRepository,
                       UserRepository userRepository) {
        this.clubRepository = clubRepository;
        this.clubMemberRepository = clubMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ClubResponse createClub(ClubRequest request) {
        return createClub(request, null);
    }

    @Transactional
    public ClubResponse createClub(ClubRequest request, String userEmail) {
        Club club = new Club();
        club.setName(request.getName());
        club.setDescription(request.getDescription());
        club.setCategory(request.getCategory());
        club.setDepartment(request.getDepartment());
        club.setCoordinatorName(request.getCoordinatorName());
        club.setActive(true);

        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null && user.getCollege() != null) {
                club.setCollege(user.getCollege());
            }
        }

        Club savedClub = clubRepository.save(club);
        return mapToResponse(savedClub);
    }

    public List<ClubResponse> getAllClubs() {
        return getAllClubs(null);
    }

    public List<ClubResponse> getAllClubs(String userEmail) {
        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null && user.getCollege() != null) {
                return clubRepository.findByCollegeId(user.getCollege().getId()).stream()
                        .map(this::mapToResponse)
                        .toList();
            }
        }
        return clubRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ClubResponse> getActiveClubs() {
        return getActiveClubs(null);
    }

    public List<ClubResponse> getActiveClubs(String userEmail) {
        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null && user.getCollege() != null) {
                return clubRepository.findByCollegeIdAndActiveTrue(user.getCollege().getId()).stream()
                        .map(this::mapToResponse)
                        .toList();
            }
        }
        return clubRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ClubResponse getClubById(Long id) {
        return getClubById(id, null);
    }

    public ClubResponse getClubById(Long id, String userEmail) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + id));

        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null && user.getCollege() != null && club.getCollege() != null) {
                if (!user.getCollege().getId().equals(club.getCollege().getId())) {
                    throw new ResourceNotFoundException("Club not found with id: " + id);
                }
            }
        }

        return mapToResponse(club);
    }

    @Transactional
    public ClubResponse updateClub(Long id, ClubRequest request) {
        return updateClub(id, request, null);
    }

    @Transactional
    public ClubResponse updateClub(Long id, ClubRequest request, String userEmail) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + id));

        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null && user.getCollege() != null && club.getCollege() != null) {
                if (!user.getCollege().getId().equals(club.getCollege().getId())) {
                    throw new ResourceNotFoundException("Club not found with id: " + id);
                }
            }
        }

        club.setName(request.getName());
        club.setDescription(request.getDescription());
        club.setCategory(request.getCategory());
        club.setDepartment(request.getDepartment());
        club.setCoordinatorName(request.getCoordinatorName());

        Club updatedClub = clubRepository.save(club);
        return mapToResponse(updatedClub);
    }

    @Transactional
    public void deleteClub(Long id) {
        deleteClub(id, null);
    }

    @Transactional
    public void deleteClub(Long id, String userEmail) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + id));

        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null && user.getCollege() != null && club.getCollege() != null) {
                if (!user.getCollege().getId().equals(club.getCollege().getId())) {
                    throw new ResourceNotFoundException("Club not found with id: " + id);
                }
            }
        }

        clubMemberRepository.deleteByClubId(id);
        clubRepository.deleteById(id);
    }

    private ClubResponse mapToResponse(Club club) {
        if (club == null) {
            return null;
        }
        ClubResponse response = new ClubResponse();
        response.setId(club.getId());
        response.setName(club.getName());
        response.setDescription(club.getDescription());
        response.setCategory(club.getCategory());
        response.setDepartment(club.getDepartment());
        response.setCoordinatorName(club.getCoordinatorName());
        response.setCreatedAt(club.getCreatedAt());
        response.setActive(club.isActive());
        if (club.getCollege() != null) {
            response.setCollegeId(club.getCollege().getId());
            response.setCollegeName(club.getCollege().getName());
        }
        return response;
    }
}
