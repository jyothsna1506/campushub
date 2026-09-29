package com.campushub.backend.repository;

import com.campushub.backend.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    List<Club> findByActiveTrue();

    long countByActiveTrue();

    List<Club> findByCollegeIdAndActiveTrue(Long collegeId);

    List<Club> findByCollegeId(Long collegeId);

    java.util.Optional<Club> findByIdAndCollegeIdAndActiveTrue(Long id, Long collegeId);

    java.util.Optional<Club> findByIdAndCollegeId(Long id, Long collegeId);

    long countByCollegeIdAndActiveTrue(Long collegeId);

    long countByCollegeId(Long collegeId);
}
