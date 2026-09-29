package com.campushub.backend.repository;

import com.campushub.backend.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByActiveTrueOrderByStartTimeAsc();

    List<Event> findAllByOrderByStartTimeAsc();

    long countByActiveTrue();

    List<Event> findByCollegeIdAndActiveTrueOrderByStartTimeAsc(Long collegeId);

    List<Event> findByCollegeIdOrderByStartTimeAsc(Long collegeId);

    java.util.Optional<Event> findByIdAndCollegeIdAndActiveTrue(Long id, Long collegeId);

    java.util.Optional<Event> findByIdAndCollegeId(Long id, Long collegeId);

    long countByCollegeIdAndActiveTrue(Long collegeId);

    long countByCollegeId(Long collegeId);
}
