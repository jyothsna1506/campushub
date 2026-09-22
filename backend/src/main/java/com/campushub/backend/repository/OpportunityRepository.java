package com.campushub.backend.repository;

import com.campushub.backend.entity.Opportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {

    List<Opportunity> findByActiveTrueOrderByApplicationDeadlineAsc();

    List<Opportunity> findAllByOrderByApplicationDeadlineAsc();
}
