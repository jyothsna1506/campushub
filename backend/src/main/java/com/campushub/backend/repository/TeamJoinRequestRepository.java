package com.campushub.backend.repository;

import com.campushub.backend.entity.TeamJoinRequest;
import com.campushub.backend.entity.TeamJoinRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamJoinRequestRepository extends JpaRepository<TeamJoinRequest, Long> {

    Optional<TeamJoinRequest> findByUserIdAndTeamIdAndStatus(Long userId, Long teamId, TeamJoinRequestStatus status);

    boolean existsByUserIdAndTeamIdAndStatus(Long userId, Long teamId, TeamJoinRequestStatus status);

    List<TeamJoinRequest> findByTeamId(Long teamId);

    List<TeamJoinRequest> findByUserId(Long userId);

    void deleteByTeamId(Long teamId);
}
