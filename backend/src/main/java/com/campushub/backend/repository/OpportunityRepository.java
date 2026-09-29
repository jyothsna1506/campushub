package com.campushub.backend.repository;

import com.campushub.backend.entity.Opportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {

    List<Opportunity> findByActiveTrueOrderByApplicationDeadlineAsc();

    List<Opportunity> findAllByOrderByApplicationDeadlineAsc();

    long countByActiveTrue();

    List<Opportunity> findByCollegeIdAndActiveTrueOrderByApplicationDeadlineAsc(Long collegeId);

    List<Opportunity> findByCollegeIdOrderByApplicationDeadlineAsc(Long collegeId);

    java.util.Optional<Opportunity> findByIdAndCollegeIdAndActiveTrue(Long id, Long collegeId);

    java.util.Optional<Opportunity> findByIdAndCollegeId(Long id, Long collegeId);

    long countByCollegeIdAndActiveTrue(Long collegeId);

    long countByCollegeId(Long collegeId);
}
