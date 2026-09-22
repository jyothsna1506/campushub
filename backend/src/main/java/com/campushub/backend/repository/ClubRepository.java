package com.campushub.backend.repository;

import com.campushub.backend.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    List<Club> findByActiveTrue();
}
