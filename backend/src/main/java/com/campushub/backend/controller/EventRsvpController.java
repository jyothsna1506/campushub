package com.campushub.backend.controller;

import com.campushub.backend.dto.EventRsvpResponse;
import com.campushub.backend.service.EventRsvpService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
public class EventRsvpController {

    private final EventRsvpService eventRsvpService;

    public EventRsvpController(EventRsvpService eventRsvpService) {
        this.eventRsvpService = eventRsvpService;
    }

    @PostMapping("/api/events/{eventId}/rsvp")
    public ResponseEntity<EventRsvpResponse> rsvpToEvent(@PathVariable Long eventId,
                                                         Principal principal) {
        EventRsvpResponse response = eventRsvpService.rsvpToEvent(eventId, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/api/events/{eventId}/rsvp")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> cancelRsvp(@PathVariable Long eventId,
                                           Principal principal) {
        eventRsvpService.cancelRsvp(eventId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/events/{eventId}/attendees")
    public ResponseEntity<List<EventRsvpResponse>> getEventAttendees(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventRsvpService.getEventAttendees(eventId));
    }

    @GetMapping("/api/users/me/events")
    public ResponseEntity<List<EventRsvpResponse>> getMyRsvps(Principal principal) {
        return ResponseEntity.ok(eventRsvpService.getMyRsvps(principal.getName()));
    }

    @GetMapping({"/api/events/{eventId}/rsvp/status", "/api/events/{eventId}/rsvp"})
    public ResponseEntity<Map<String, Boolean>> getRsvpStatus(@PathVariable Long eventId,
                                                              Principal principal) {
        boolean hasRsvped = eventRsvpService.hasRsvped(eventId, principal.getName());
        return ResponseEntity.ok(Map.of("hasRsvped", hasRsvped));
    }
}
