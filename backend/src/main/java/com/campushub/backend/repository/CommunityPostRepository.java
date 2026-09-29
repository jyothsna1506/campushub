package com.campushub.backend.repository;

import com.campushub.backend.entity.CommunityPost;
import com.campushub.backend.entity.CommunityPostType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    List<CommunityPost> findByCollegeIdAndActiveTrueOrderByCreatedAtDesc(Long collegeId);

    List<CommunityPost> findByCollegeIdAndTypeAndActiveTrueOrderByCreatedAtDesc(Long collegeId, CommunityPostType type);

    Optional<CommunityPost> findByIdAndActiveTrue(Long id);

    Optional<CommunityPost> findByIdAndCollegeIdAndActiveTrue(Long id, Long collegeId);

    long countByCollegeIdAndActiveTrue(Long collegeId);
}
