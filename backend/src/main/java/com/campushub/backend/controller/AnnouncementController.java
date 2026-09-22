package com.campushub.backend.controller;

import com.campushub.backend.dto.AnnouncementRequest;
import com.campushub.backend.dto.AnnouncementResponse;
import com.campushub.backend.service.AnnouncementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @PostMapping
    public ResponseEntity<AnnouncementResponse> createAnnouncement(@Valid @RequestBody AnnouncementRequest request,
                                                                   Principal principal) {
        AnnouncementResponse response = announcementService.createAnnouncement(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AnnouncementResponse>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    @GetMapping("/active")
    public ResponseEntity<List<AnnouncementResponse>> getActiveAnnouncements() {
        return ResponseEntity.ok(announcementService.getActiveAnnouncements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnouncementResponse> getAnnouncementById(@PathVariable Long id) {
        return ResponseEntity.ok(announcementService.getAnnouncementById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnnouncementResponse> updateAnnouncement(@PathVariable Long id,
                                                                   @Valid @RequestBody AnnouncementRequest request,
                                                                   Principal principal) {
        AnnouncementResponse response = announcementService.updateAnnouncement(id, request, principal.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id,
                                                   Principal principal) {
        announcementService.deleteAnnouncement(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
