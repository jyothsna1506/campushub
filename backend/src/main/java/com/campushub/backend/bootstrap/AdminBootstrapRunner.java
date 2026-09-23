package com.campushub.backend.bootstrap;

import com.campushub.backend.entity.User;
import com.campushub.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.bootstrap.enabled:true}")
    private boolean bootstrapEnabled;

    @Value("${app.admin.bootstrap.email:admin@college.edu}")
    private String adminEmail;

    @Value("${app.admin.bootstrap.password:Admin@123}")
    private String adminPassword;

    @Value("${app.admin.bootstrap.full-name:Campus Administrator}")
    private String adminFullName;

    public AdminBootstrapRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
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
                    if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
                        user.setRole("ADMIN");
                        userRepository.save(user);
                        log.info("Admin bootstrap: Promoted existing account to ADMIN for email [{}]", user.getEmail());
                    } else {
                        log.info("Admin bootstrap: Existing administrator verified for email [{}]", user.getEmail());
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

                    userRepository.save(admin);
                    log.info("Admin bootstrap: Successfully initialized administrator account for email [{}]", adminEmail);
                }
        );
    }
}
