package com.campushub.backend.repository;

import com.campushub.backend.entity.Team;
import com.campushub.backend.entity.TeamMember;
import com.campushub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    boolean existsByUserAndTeam(User user, Team team);

    boolean existsByUserIdAndTeamId(Long userId, Long teamId);

    List<TeamMember> findByTeamId(Long teamId);

    List<TeamMember> findByUserId(Long userId);

    Optional<TeamMember> findByUserAndTeam(User user, Team team);

    Optional<TeamMember> findByUserIdAndTeamId(Long userId, Long teamId);

    void deleteByTeamId(Long teamId);
}
