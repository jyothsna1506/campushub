package com.campushub.backend.repository;

import com.campushub.backend.entity.Club;
import com.campushub.backend.entity.ClubMember;
import com.campushub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubMemberRepository extends JpaRepository<ClubMember, Long> {

    boolean existsByUserAndClub(User user, Club club);

    boolean existsByUserIdAndClubId(Long userId, Long clubId);

    List<ClubMember> findByClubId(Long clubId);

    List<ClubMember> findByUserId(Long userId);

    Optional<ClubMember> findByUserAndClub(User user, Club club);

    Optional<ClubMember> findByUserIdAndClubId(Long userId, Long clubId);
}
