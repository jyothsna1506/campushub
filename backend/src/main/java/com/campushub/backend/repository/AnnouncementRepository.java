package com.campushub.backend.repository;

import com.campushub.backend.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByActiveTrueOrderByCreatedAtDesc();

    List<Announcement> findAllByOrderByCreatedAtDesc();

    long countByActiveTrue();

    List<Announcement> findByCollegeIdAndActiveTrueOrderByCreatedAtDesc(Long collegeId);

    List<Announcement> findByCollegeIdOrderByCreatedAtDesc(Long collegeId);

    java.util.Optional<Announcement> findByIdAndCollegeIdAndActiveTrue(Long id, Long collegeId);

    java.util.Optional<Announcement> findByIdAndCollegeId(Long id, Long collegeId);

    long countByCollegeIdAndActiveTrue(Long collegeId);

    long countByCollegeId(Long collegeId);
}
