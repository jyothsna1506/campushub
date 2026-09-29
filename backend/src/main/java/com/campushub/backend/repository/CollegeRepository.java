package com.campushub.backend.repository;

import com.campushub.backend.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollegeRepository extends JpaRepository<College, Long> {

    Optional<College> findByCode(String code);

    Optional<College> findByCodeIgnoreCase(String code);

    boolean existsByCode(String code);

    List<College> findByActiveTrueOrderByNameAsc();

    List<College> findAllByOrderByNameAsc();
}
