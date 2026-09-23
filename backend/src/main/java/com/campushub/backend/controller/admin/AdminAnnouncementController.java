package com.campushub.backend.controller.admin;

import com.campushub.backend.dto.AnnouncementRequest;
import com.campushub.backend.dto.AnnouncementResponse;
import com.campushub.backend.service.AnnouncementService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/announcements")
public class AdminAnnouncementController {

    private final AnnouncementService announcementService;

    public AdminAnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping
    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementService.getAllAnnouncements();
    }

    @GetMapping("/{id}")
    public AnnouncementResponse getAnnouncementById(@PathVariable Long id) {
        return announcementService.getAnnouncementById(id);
    }

    @PostMapping
    public AnnouncementResponse createAnnouncement(@Valid @RequestBody AnnouncementRequest request, Authentication authentication) {
        return announcementService.createAnnouncement(request, authentication.getName());
    }

    @PutMapping("/{id}")
    public AnnouncementResponse updateAnnouncement(@PathVariable Long id, @Valid @RequestBody AnnouncementRequest request) {
        return announcementService.adminUpdateAnnouncement(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteAnnouncement(@PathVariable Long id) {
        announcementService.adminDeleteAnnouncement(id);
    }
}
