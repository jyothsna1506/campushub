package com.campushub.backend.repository;

import com.campushub.backend.entity.CommunityComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {

    List<CommunityComment> findByPostIdAndActiveTrueOrderByCreatedAtAsc(Long postId);

    long countByPostIdAndActiveTrue(Long postId);

    Optional<CommunityComment> findByIdAndActiveTrue(Long id);
}
