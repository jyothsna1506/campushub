package com.campushub.backend.repository;

import com.campushub.backend.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    List<Team> findByOpenForMembersTrue();

    List<Team> findByOwnerId(Long ownerId);
}
