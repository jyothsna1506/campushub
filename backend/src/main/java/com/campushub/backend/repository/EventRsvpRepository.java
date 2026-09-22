package com.campushub.backend.repository;

import com.campushub.backend.entity.Event;
import com.campushub.backend.entity.EventRsvp;
import com.campushub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRsvpRepository extends JpaRepository<EventRsvp, Long> {

    boolean existsByUserAndEvent(User user, Event event);

    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    List<EventRsvp> findByEventId(Long eventId);

    List<EventRsvp> findByUserId(Long userId);

    Optional<EventRsvp> findByUserAndEvent(User user, Event event);

    Optional<EventRsvp> findByUserIdAndEventId(Long userId, Long eventId);

    long countByEventId(Long eventId);
}
