package com.campushub.backend.controller;

import com.campushub.backend.dto.EventRequest;
import com.campushub.backend.dto.EventResponse;
import com.campushub.backend.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest request,
                                                     Principal principal) {
        EventResponse response = eventService.createEvent(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/active")
    public ResponseEntity<List<EventResponse>> getActiveEvents() {
        return ResponseEntity.ok(eventService.getActiveEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Long id,
                                                     @Valid @RequestBody EventRequest request,
                                                     Principal principal) {
        EventResponse response = eventService.updateEvent(id, request, principal.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id,
                                            Principal principal) {
        eventService.deleteEvent(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
