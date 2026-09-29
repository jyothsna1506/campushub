package com.campushub.backend.controller.admin;

import com.campushub.backend.dto.EventRequest;
import com.campushub.backend.dto.EventResponse;
import com.campushub.backend.service.EventService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/events")
public class AdminEventController {

    private final EventService eventService;

    public AdminEventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<EventResponse> getAllEvents(Authentication authentication) {
        return eventService.getAllEvents(authentication != null ? authentication.getName() : null);
    }

    @GetMapping("/{id}")
    public EventResponse getEventById(@PathVariable Long id, Authentication authentication) {
        return eventService.getEventById(id, authentication != null ? authentication.getName() : null);
    }

    @PostMapping
    public EventResponse createEvent(@Valid @RequestBody EventRequest request, Authentication authentication) {
        return eventService.createEvent(request, authentication.getName());
    }

    @PutMapping("/{id}")
    public EventResponse updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request, Authentication authentication) {
        return eventService.adminUpdateEvent(id, request, authentication != null ? authentication.getName() : null);
    }

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id, Authentication authentication) {
        eventService.adminDeleteEvent(id, authentication != null ? authentication.getName() : null);
    }
}
