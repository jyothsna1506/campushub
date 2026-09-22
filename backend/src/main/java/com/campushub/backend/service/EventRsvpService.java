package com.campushub.backend.service;

import com.campushub.backend.dto.EventRsvpResponse;
import com.campushub.backend.entity.Event;
import com.campushub.backend.entity.EventRsvp;
import com.campushub.backend.entity.User;
import com.campushub.backend.exception.DuplicateResourceException;
import com.campushub.backend.exception.ResourceNotFoundException;
import com.campushub.backend.repository.EventRepository;
import com.campushub.backend.repository.EventRsvpRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EventRsvpService {

    private final EventRsvpRepository eventRsvpRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventRsvpService(EventRsvpRepository eventRsvpRepository,
                            EventRepository eventRepository,
                            UserRepository userRepository) {
        this.eventRsvpRepository = eventRsvpRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public EventRsvpResponse rsvpToEvent(Long eventId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (!event.isActive()) {
            throw new DuplicateResourceException("Cannot RSVP to an inactive event");
        }

        if (eventRsvpRepository.existsByUserAndEvent(user, event)) {
            throw new DuplicateResourceException("You have already RSVP'd to this event: " + event.getTitle());
        }

        long currentRsvps = eventRsvpRepository.countByEventId(eventId);
        if (currentRsvps >= event.getCapacity()) {
            throw new DuplicateResourceException("Event has reached its maximum capacity of " + event.getCapacity());
        }

        EventRsvp rsvp = new EventRsvp(user, event);
        EventRsvp savedRsvp = eventRsvpRepository.save(rsvp);
        return mapToResponse(savedRsvp);
    }

    @Transactional
    public void cancelRsvp(Long eventId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        EventRsvp rsvp = eventRsvpRepository.findByUserAndEvent(user, event)
                .orElseThrow(() -> new ResourceNotFoundException("No RSVP found for event: " + event.getTitle()));

        eventRsvpRepository.delete(rsvp);
    }

    public List<EventRsvpResponse> getEventAttendees(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event not found with id: " + eventId);
        }
        return eventRsvpRepository.findByEventId(eventId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<EventRsvpResponse> getMyRsvps(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return eventRsvpRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public boolean hasRsvped(Long eventId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return eventRsvpRepository.existsByUserIdAndEventId(user.getId(), eventId);
    }

    private EventRsvpResponse mapToResponse(EventRsvp rsvp) {
        if (rsvp == null) {
            return null;
        }
        return new EventRsvpResponse(
                rsvp.getId(),
                rsvp.getUser().getId(),
                rsvp.getUser().getFullName(),
                rsvp.getEvent().getId(),
                rsvp.getEvent().getTitle(),
                rsvp.getRegisteredAt()
        );
    }
}
