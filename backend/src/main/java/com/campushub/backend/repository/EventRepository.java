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
}
