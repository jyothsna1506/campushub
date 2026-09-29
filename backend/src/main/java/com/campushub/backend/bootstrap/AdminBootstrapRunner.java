package com.campushub.backend.bootstrap;

import com.campushub.backend.entity.College;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final CollegeRepository collegeRepository;
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final TeamRepository teamRepository;
    private final AnnouncementRepository announcementRepository;
    private final OpportunityRepository opportunityRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.bootstrap.enabled:true}")
    private boolean bootstrapEnabled;

    @Value("${app.admin.bootstrap.email:admin@college.edu}")
    private String adminEmail;

    @Value("${app.admin.bootstrap.password:Admin@123}")
    private String adminPassword;

    @Value("${app.admin.bootstrap.full-name:Campus Administrator}")
    private String adminFullName;

    public AdminBootstrapRunner(
            CollegeRepository collegeRepository,
            UserRepository userRepository,
            ClubRepository clubRepository,
            EventRepository eventRepository,
            TeamRepository teamRepository,
            AnnouncementRepository announcementRepository,
            OpportunityRepository opportunityRepository,
            PasswordEncoder passwordEncoder) {
        this.collegeRepository = collegeRepository;
        this.userRepository = userRepository;
        this.clubRepository = clubRepository;
        this.eventRepository = eventRepository;
        this.teamRepository = teamRepository;
        this.announcementRepository = announcementRepository;
        this.opportunityRepository = opportunityRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Ensure Default Colleges Exist
        College demoCollege = collegeRepository.findByCodeIgnoreCase("DEMO").orElseGet(() -> {
            College c = new College("CampusHub Demo College", "DEMO", "Primary demo campus institution");
            return collegeRepository.save(c);
        });

        // Ensure Secondary College for multi-college demonstration
        collegeRepository.findByCodeIgnoreCase("TECH").orElseGet(() -> {
            College c = new College("Institute of Technology & Science", "TECH", "Engineering and technology campus");
            return collegeRepository.save(c);
        });

        // 2. Safe Migration of existing legacy data without college
        userRepository.findAll().forEach(u -> {
            if (u.getCollege() == null) {
                u.setCollege(demoCollege);
                userRepository.save(u);
            }
        });

        clubRepository.findAll().forEach(club -> {
            if (club.getCollege() == null) {
                club.setCollege(demoCollege);
                clubRepository.save(club);
            }
        });

        eventRepository.findAll().forEach(event -> {
            if (event.getCollege() == null) {
                event.setCollege(demoCollege);
                eventRepository.save(event);
            }
        });

        teamRepository.findAll().forEach(team -> {
            if (team.getCollege() == null) {
                team.setCollege(demoCollege);
                teamRepository.save(team);
            }
        });

        announcementRepository.findAll().forEach(ann -> {
            if (ann.getCollege() == null) {
                ann.setCollege(demoCollege);
                announcementRepository.save(ann);
            }
        });

        opportunityRepository.findAll().forEach(opp -> {
            if (opp.getCollege() == null) {
                opp.setCollege(demoCollege);
                opportunityRepository.save(opp);
            }
        });

        // 3. Admin Bootstrap
        if (!bootstrapEnabled) {
            log.info("Admin bootstrap is disabled by configuration");
            return;
        }

        if (adminEmail == null || adminEmail.isBlank()) {
            log.warn("Admin bootstrap skipped: email is blank");
            return;
        }

        userRepository.findByEmail(adminEmail.trim().toLowerCase()).ifPresentOrElse(
                user -> {
                    boolean updated = false;
                    if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
                        user.setRole("ADMIN");
                        updated = true;
                        log.info("Admin bootstrap: Promoted existing account to ADMIN for email [{}]", user.getEmail());
                    } else {
                        log.info("Admin bootstrap: Existing administrator verified for email [{}]", user.getEmail());
                    }
                    if (user.getCollege() == null) {
                        user.setCollege(demoCollege);
                        updated = true;
                    }
                    if (updated) {
                        userRepository.save(user);
                    }
                },
                () -> {
                    User admin = new User();
                    admin.setFullName(adminFullName);
                    admin.setEmail(adminEmail.trim().toLowerCase());
                    admin.setPassword(passwordEncoder.encode(adminPassword));
                    admin.setRole("ADMIN");
                    admin.setProgram("Administration");
                    admin.setBranch("Operations");
                    admin.setYear(4);
                    admin.setBio("CampusHub System Administrator");
                    admin.setCollege(demoCollege);

                    userRepository.save(admin);
                    log.info("Admin bootstrap: Successfully initialized administrator account for email [{}]", adminEmail);
                }
        );
    }
}
