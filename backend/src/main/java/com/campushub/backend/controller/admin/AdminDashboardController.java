package com.campushub.backend.controller.admin;

import com.campushub.backend.dto.AdminDashboardStatsResponse;
import com.campushub.backend.repository.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final TeamRepository teamRepository;
    private final AnnouncementRepository announcementRepository;
    private final OpportunityRepository opportunityRepository;

    public AdminDashboardController(UserRepository userRepository,
                                    ClubRepository clubRepository,
                                    EventRepository eventRepository,
                                    TeamRepository teamRepository,
                                    AnnouncementRepository announcementRepository,
                                    OpportunityRepository opportunityRepository) {
        this.userRepository = userRepository;
        this.clubRepository = clubRepository;
        this.eventRepository = eventRepository;
        this.teamRepository = teamRepository;
        this.announcementRepository = announcementRepository;
        this.opportunityRepository = opportunityRepository;
    }

    @GetMapping("/stats")
    public AdminDashboardStatsResponse getDashboardStats() {
        return new AdminDashboardStatsResponse(
                userRepository.count(),
                clubRepository.count(),
                clubRepository.countByActiveTrue(),
                eventRepository.count(),
                eventRepository.countByActiveTrue(),
                teamRepository.count(),
                announcementRepository.count(),
                announcementRepository.countByActiveTrue(),
                opportunityRepository.count(),
                opportunityRepository.countByActiveTrue()
        );
    }
}
