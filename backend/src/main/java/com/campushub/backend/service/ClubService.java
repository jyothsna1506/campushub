package com.campushub.backend.service;

import com.campushub.backend.dto.ClubRequest;
import com.campushub.backend.dto.ClubResponse;
import com.campushub.backend.entity.Club;
import com.campushub.backend.exception.ResourceNotFoundException;
import com.campushub.backend.repository.ClubRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClubService {

    private final ClubRepository clubRepository;

    public ClubService(ClubRepository clubRepository) {
        this.clubRepository = clubRepository;
    }

    public ClubResponse createClub(ClubRequest request) {
        Club club = new Club();
        club.setName(request.getName());
        club.setDescription(request.getDescription());
        club.setCategory(request.getCategory());
        club.setDepartment(request.getDepartment());
        club.setCoordinatorName(request.getCoordinatorName());
        club.setActive(true);

        Club savedClub = clubRepository.save(club);
        return mapToResponse(savedClub);
    }

    public List<ClubResponse> getAllClubs() {
        return clubRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ClubResponse> getActiveClubs() {
        return clubRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ClubResponse getClubById(Long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + id));
        return mapToResponse(club);
    }

    public ClubResponse updateClub(Long id, ClubRequest request) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + id));

        club.setName(request.getName());
        club.setDescription(request.getDescription());
        club.setCategory(request.getCategory());
        club.setDepartment(request.getDepartment());
        club.setCoordinatorName(request.getCoordinatorName());

        Club updatedClub = clubRepository.save(club);
        return mapToResponse(updatedClub);
    }

    public void deleteClub(Long id) {
        if (!clubRepository.existsById(id)) {
            throw new ResourceNotFoundException("Club not found with id: " + id);
        }
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
        return response;
    }
}
