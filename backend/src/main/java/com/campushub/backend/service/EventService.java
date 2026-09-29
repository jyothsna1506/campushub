package com.campushub.backend.service;

import com.campushub.backend.dto.EventRequest;
import com.campushub.backend.dto.EventResponse;
import com.campushub.backend.entity.Event;
import com.campushub.backend.entity.User;
import com.campushub.backend.exception.ResourceNotFoundException;
import com.campushub.backend.repository.EventRepository;
import com.campushub.backend.repository.EventRsvpRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventRsvpRepository eventRsvpRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository,
                        EventRsvpRepository eventRsvpRepository,
                        UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.eventRsvpRepository = eventRsvpRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public EventResponse createEvent(EventRequest request, String userEmail) {
        validateEventTiming(request);

        User organizer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setCategory(request.getCategory());
        event.setVenue(request.getVenue());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setOrganizer(organizer);
        event.setCapacity(request.getCapacity());
        event.setActive(true);
        if (organizer.getCollege() != null) {
            event.setCollege(organizer.getCollege());
        }

        Event savedEvent = eventRepository.save(event);
        return mapToResponse(savedEvent);
    }

    public List<EventResponse> getAllEvents() {
        return getAllEvents(null);
    }

    public List<EventResponse> getAllEvents(String userEmail) {
        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null && user.getCollege() != null) {
                return eventRepository.findByCollegeIdOrderByStartTimeAsc(user.getCollege().getId()).stream()
                        .map(this::mapToResponse)
                        .toList();
            }
        }
        return eventRepository.findAllByOrderByStartTimeAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<EventResponse> getActiveEvents() {
        return getActiveEvents(null);
    }

    public List<EventResponse> getActiveEvents(String userEmail) {
        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null && user.getCollege() != null) {
                return eventRepository.findByCollegeIdAndActiveTrueOrderByStartTimeAsc(user.getCollege().getId()).stream()
                        .map(this::mapToResponse)
                        .toList();
            }
        }
        return eventRepository.findByActiveTrueOrderByStartTimeAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public EventResponse getEventById(Long id) {
        return getEventById(id, null);
    }

    public EventResponse getEventById(Long id, String userEmail) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null && user.getCollege() != null && event.getCollege() != null) {
                if (!user.getCollege().getId().equals(event.getCollege().getId())) {
                    throw new ResourceNotFoundException("Event not found with id: " + id);
                }
            }
        }

        return mapToResponse(event);
    }

    @Transactional
    public EventResponse updateEvent(Long id, EventRequest request, String userEmail) {
        validateEventTiming(request);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        if (!event.getOrganizer().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Only the event organizer can update this event");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setCategory(request.getCategory());
        event.setVenue(request.getVenue());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setCapacity(request.getCapacity());

        Event updatedEvent = eventRepository.save(event);
        return mapToResponse(updatedEvent);
    }

    @Transactional
    public void deleteEvent(Long id, String userEmail) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        if (!event.getOrganizer().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Only the event organizer can delete this event");
        }

        eventRsvpRepository.deleteByEventId(id);
        eventRepository.delete(event);
    }

    @Transactional
    public EventResponse adminUpdateEvent(Long id, EventRequest request) {
        return adminUpdateEvent(id, request, null);
    }

    @Transactional
    public EventResponse adminUpdateEvent(Long id, EventRequest request, String adminEmail) {
        validateEventTiming(request);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        if (adminEmail != null) {
            User admin = userRepository.findByEmail(adminEmail).orElse(null);
            if (admin != null && admin.getCollege() != null && event.getCollege() != null) {
                if (!admin.getCollege().getId().equals(event.getCollege().getId())) {
                    throw new ResourceNotFoundException("Event not found with id: " + id);
                }
            }
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setCategory(request.getCategory());
        event.setVenue(request.getVenue());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setCapacity(request.getCapacity());

        Event updatedEvent = eventRepository.save(event);
        return mapToResponse(updatedEvent);
    }

    @Transactional
    public void adminDeleteEvent(Long id) {
        adminDeleteEvent(id, null);
    }

    @Transactional
    public void adminDeleteEvent(Long id, String adminEmail) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        if (adminEmail != null) {
            User admin = userRepository.findByEmail(adminEmail).orElse(null);
            if (admin != null && admin.getCollege() != null && event.getCollege() != null) {
                if (!admin.getCollege().getId().equals(event.getCollege().getId())) {
                    throw new ResourceNotFoundException("Event not found with id: " + id);
                }
            }
        }

        eventRsvpRepository.deleteByEventId(id);
        eventRepository.delete(event);
    }

    private void validateEventTiming(EventRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }

    private EventResponse mapToResponse(Event event) {
        if (event == null) {
            return null;
        }
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getCategory(),
                event.getVenue(),
                event.getStartTime(),
                event.getEndTime(),
                event.getOrganizer().getId(),
                event.getOrganizer().getFullName(),
                event.getCapacity(),
                event.getCreatedAt(),
                event.isActive(),
                event.getCollege() != null ? event.getCollege().getId() : null,
                event.getCollege() != null ? event.getCollege().getName() : null
        );
    }
}
