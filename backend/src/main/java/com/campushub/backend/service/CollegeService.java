package com.campushub.backend.service;

import com.campushub.backend.dto.CollegeRequest;
import com.campushub.backend.dto.CollegeResponse;
import com.campushub.backend.entity.College;
import com.campushub.backend.exception.DuplicateResourceException;
import com.campushub.backend.exception.ResourceNotFoundException;
import com.campushub.backend.repository.CollegeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CollegeService {

    private final CollegeRepository collegeRepository;

    public CollegeService(CollegeRepository collegeRepository) {
        this.collegeRepository = collegeRepository;
    }

    public List<CollegeResponse> getAllColleges() {
        return collegeRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CollegeResponse> getActiveColleges() {
        return collegeRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CollegeResponse getCollegeById(Long id) {
        College college = collegeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("College not found with id: " + id));
        return mapToResponse(college);
    }

    public College getCollegeEntityById(Long id) {
        return collegeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("College not found with id: " + id));
    }

    @Transactional
    public CollegeResponse createCollege(CollegeRequest request) {
        String normalizedCode = request.getCode().trim().toUpperCase();
        if (collegeRepository.existsByCode(normalizedCode)) {
            throw new DuplicateResourceException("College code already exists: " + normalizedCode);
        }

        College college = new College();
        college.setName(request.getName().trim());
        college.setCode(normalizedCode);
        college.setDescription(request.getDescription());
        college.setActive(request.getActive() == null || request.getActive());

        College saved = collegeRepository.save(college);
        return mapToResponse(saved);
    }

    @Transactional
    public CollegeResponse updateCollege(Long id, CollegeRequest request) {
        College college = collegeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("College not found with id: " + id));

        String normalizedCode = request.getCode().trim().toUpperCase();
        if (!college.getCode().equalsIgnoreCase(normalizedCode) && collegeRepository.existsByCode(normalizedCode)) {
            throw new DuplicateResourceException("College code already exists: " + normalizedCode);
        }

        college.setName(request.getName().trim());
        college.setCode(normalizedCode);
        college.setDescription(request.getDescription());
        if (request.getActive() != null) {
            college.setActive(request.getActive());
        }

        College saved = collegeRepository.save(college);
        return mapToResponse(saved);
    }

    public CollegeResponse mapToResponse(College college) {
        if (college == null) {
            return null;
        }
        return new CollegeResponse(
                college.getId(),
                college.getName(),
                college.getCode(),
                college.getDescription(),
                college.isActive(),
                college.getCreatedAt()
        );
    }
}
