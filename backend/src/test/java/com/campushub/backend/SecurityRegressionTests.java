package com.campushub.backend;

import com.campushub.backend.dto.LoginRequest;
import com.campushub.backend.dto.RegisterRequest;
import com.campushub.backend.dto.UserUpdateRequest;
import com.campushub.backend.entity.Club;
import com.campushub.backend.entity.College;
import com.campushub.backend.entity.Event;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.ClubRepository;
import com.campushub.backend.repository.CollegeRepository;
import com.campushub.backend.repository.EventRepository;
import com.campushub.backend.repository.UserRepository;
import com.campushub.backend.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class SecurityRegressionTests {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserService userService;

    private College demoCollege;
    private College techCollege;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        demoCollege = collegeRepository.findByCode("DEMO").orElseGet(() -> {
            College c = new College("CampusHub Demo College", "DEMO", "Demo institution");
            return collegeRepository.save(c);
        });

        techCollege = collegeRepository.findByCode("TECH").orElseGet(() -> {
            College c = new College("Tech Institute of Science", "TECH", "Tech institution");
            return collegeRepository.save(c);
        });
    }

    private String obtainToken(String email, String password) throws Exception {
        LoginRequest login = new LoginRequest();
        login.setEmail(email);
        login.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.get("token").asText();
    }

    @Test
    @DisplayName("1. Public home endpoint returns 200 OK")
    void testPublicHomeEndpoint() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("2. Unauthenticated protected endpoint returns 401 Unauthorized")
    void testUnauthenticatedProtectedEndpoint() throws Exception {
        mockMvc.perform(get("/api/clubs"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("3 & 4. Student login and regular APIs return 200 OK")
    void testStudentLoginAndRegularApi() throws Exception {
        String testEmail = "regression_student_" + System.currentTimeMillis() + "@college.edu";
        RegisterRequest reg = new RegisterRequest();
        reg.setFullName("Test Student");
        reg.setEmail(testEmail);
        reg.setPassword("Password123!");
        reg.setProgram("Engineering");
        reg.setBranch("CSE");
        reg.setYear(2);
        reg.setCollegeId(demoCollege.getId());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.collegeId").value(demoCollege.getId()));

        String studentToken = obtainToken(testEmail, "Password123!");
        assertThat(studentToken).isNotEmpty();

        mockMvc.perform(get("/api/clubs")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/events")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/announcements")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("5. Student accessing admin endpoint returns 403 Forbidden")
    void testStudentAdminAccessForbidden() throws Exception {
        String testEmail = "regression_student_forbidden_" + System.currentTimeMillis() + "@college.edu";
        RegisterRequest reg = new RegisterRequest();
        reg.setFullName("Unauthorized Student");
        reg.setEmail(testEmail);
        reg.setPassword("Password123!");
        reg.setCollegeId(demoCollege.getId());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk());

        String studentToken = obtainToken(testEmail, "Password123!");

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"));

        mockMvc.perform(get("/api/admin/dashboard/stats")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("6. Admin accessing admin endpoint returns 200 OK")
    void testAdminAccessAllowed() throws Exception {
        String adminToken = obtainToken("admin@college.edu", "Admin@123");
        assertThat(adminToken).isNotEmpty();

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/dashboard/stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").isNumber())
                .andExpect(jsonPath("$.collegeName").isNotEmpty());
    }

    @Test
    @DisplayName("7. Tampered JWT token returns 401 Unauthorized")
    void testTamperedTokenReturns401() throws Exception {
        String adminToken = obtainToken("admin@college.edu", "Admin@123");
        String tamperedToken = adminToken + "tampered_signature";

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + tamperedToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("8. Expired JWT token returns 401 Unauthorized")
    void testExpiredTokenReturns401() throws Exception {
        String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
        java.security.Key key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                io.jsonwebtoken.io.Decoders.BASE64.decode(secret)
        );

        String expiredToken = io.jsonwebtoken.Jwts.builder()
                .setSubject("admin@college.edu")
                .claim("role", "ADMIN")
                .setIssuedAt(new Date(System.currentTimeMillis() - 100000))
                .setExpiration(new Date(System.currentTimeMillis() - 50000))
                .signWith(key, io.jsonwebtoken.SignatureAlgorithm.HS256)
                .compact();

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("9. Malformed Bearer header returns 401 Unauthorized")
    void testMalformedBearerHeaderReturns401() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "NotABearerToken"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("10. Missing Authorization header returns 401 Unauthorized")
    void testMissingAuthorizationHeaderReturns401() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("11. API responses never expose password or password hash")
    void testNoPasswordLeakInResponses() throws Exception {
        String adminToken = obtainToken("admin@college.edu", "Admin@123");

        MvcResult result = mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertThat(body).doesNotContain("password");
        assertThat(body).doesNotContain("$2a$");
        assertThat(body).doesNotContain("$2b$");
    }

    @Test
    @DisplayName("12. Normal profile update cannot elevate role to ADMIN")
    void testProfileUpdateCannotElevateRole() throws Exception {
        String testEmail = "profile_hack_" + System.currentTimeMillis() + "@college.edu";
        RegisterRequest reg = new RegisterRequest();
        reg.setFullName("Profile Test");
        reg.setEmail(testEmail);
        reg.setPassword("Password123!");
        reg.setCollegeId(demoCollege.getId());

        MvcResult res = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode userNode = objectMapper.readTree(res.getResponse().getContentAsString());
        Long userId = userNode.get("id").asLong();

        String studentToken = obtainToken(testEmail, "Password123!");

        String maliciousUpdate = "{\"fullName\": \"Hacker\", \"role\": \"ADMIN\"}";

        mockMvc.perform(put("/api/users/" + userId)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(maliciousUpdate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test
    @DisplayName("13. Last remaining administrator cannot be removed")
    void testLastAdminProtection() {
        User admin = userRepository.findByEmail("admin@college.edu").orElse(null);
        assertThat(admin).isNotNull();

        long count = userRepository.countByRole("ADMIN");
        if (count == 1) {
            assertThrows(IllegalStateException.class, () -> {
                userService.updateUserRole(admin.getId(), "STUDENT");
            });
        }
    }

    @Test
    @DisplayName("14. Validation errors return 400 Bad Request")
    void testValidationErrorsReturn400() throws Exception {
        RegisterRequest invalid = new RegisterRequest();
        invalid.setFullName("");
        invalid.setEmail("not-an-email");
        invalid.setPassword("123");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    @DisplayName("15. Duplicate email registration returns 409 Conflict")
    void testDuplicateEmailReturns409() throws Exception {
        String testEmail = "duplicate_" + System.currentTimeMillis() + "@college.edu";
        RegisterRequest reg = new RegisterRequest();
        reg.setFullName("User One");
        reg.setEmail(testEmail);
        reg.setPassword("Password123!");
        reg.setCollegeId(demoCollege.getId());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    @DisplayName("16. Missing resource returns 404 Not Found")
    void testMissingResourceReturns404() throws Exception {
        String adminToken = obtainToken("admin@college.edu", "Admin@123");

        mockMvc.perform(get("/api/clubs/99999999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    @DisplayName("17. CORS preflight succeeds for configured frontend origin")
    void testCorsPreflight() throws Exception {
        mockMvc.perform(options("/api/clubs")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("18. Public active colleges endpoint returns 200 and lists colleges")
    void testActiveCollegesPublicEndpoint() throws Exception {
        mockMvc.perform(get("/api/colleges/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].code").isNotEmpty());
    }

    @Test
    @DisplayName("19. Registration with invalid college returns 404 Not Found")
    void testRegistrationWithInvalidCollegeReturns404() throws Exception {
        RegisterRequest invalidCollege = new RegisterRequest();
        invalidCollege.setFullName("Test User");
        invalidCollege.setEmail("invalid_col_" + System.currentTimeMillis() + "@college.edu");
        invalidCollege.setPassword("Password123!");
        invalidCollege.setCollegeId(999999L);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidCollege)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    @DisplayName("20. Profile update cannot change user's college")
    void testProfileUpdateCannotChangeCollege() throws Exception {
        String testEmail = "immutable_col_" + System.currentTimeMillis() + "@college.edu";
        RegisterRequest reg = new RegisterRequest();
        reg.setFullName("Immutable College User");
        reg.setEmail(testEmail);
        reg.setPassword("Password123!");
        reg.setCollegeId(demoCollege.getId());

        MvcResult res = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode userNode = objectMapper.readTree(res.getResponse().getContentAsString());
        Long userId = userNode.get("id").asLong();

        String token = obtainToken(testEmail, "Password123!");

        // Try to update college to techCollege
        String maliciousUpdate = "{\"fullName\": \"Updated Name\", \"collegeId\": " + techCollege.getId() + "}";

        mockMvc.perform(put("/api/users/" + userId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(maliciousUpdate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collegeId").value(demoCollege.getId()));
    }

    @Test
    @DisplayName("21. Cross-college club isolation: College A student cannot access/join College B club")
    void testCrossCollegeClubIsolation() throws Exception {
        // Create student in College B (techCollege)
        String techStudentEmail = "tech_student_" + System.currentTimeMillis() + "@tech.edu";
        RegisterRequest regB = new RegisterRequest();
        regB.setFullName("Tech Student");
        regB.setEmail(techStudentEmail);
        regB.setPassword("Password123!");
        regB.setCollegeId(techCollege.getId());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regB)))
                .andExpect(status().isOk());

        String techToken = obtainToken(techStudentEmail, "Password123!");

        // Create a club in demoCollege
        Club demoClub = new Club("Demo Chess Club", "Chess club in Demo College", "Sports", "General", "Demo Coordinator");
        demoClub.setCollege(demoCollege);
        demoClub.setActive(true);
        demoClub = clubRepository.save(demoClub);

        // Tech student accessing Demo club by ID directly should receive 404
        mockMvc.perform(get("/api/clubs/" + demoClub.getId())
                        .header("Authorization", "Bearer " + techToken))
                .andExpect(status().isNotFound());

        // Tech student attempting to join Demo club should receive 403 Forbidden
        mockMvc.perform(post("/api/clubs/" + demoClub.getId() + "/join")
                        .header("Authorization", "Bearer " + techToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("22. Cross-college event isolation: College A student cannot RSVP to College B event")
    void testCrossCollegeEventIsolation() throws Exception {
        // Create student in College B
        String techStudentEmail = "tech_event_student_" + System.currentTimeMillis() + "@tech.edu";
        RegisterRequest regB = new RegisterRequest();
        regB.setFullName("Tech Event Student");
        regB.setEmail(techStudentEmail);
        regB.setPassword("Password123!");
        regB.setCollegeId(techCollege.getId());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regB)))
                .andExpect(status().isOk());

        String techToken = obtainToken(techStudentEmail, "Password123!");

        User admin = userRepository.findByEmail("admin@college.edu").orElseThrow();
        Event demoEvent = new Event();
        demoEvent.setTitle("Demo College Hackathon");
        demoEvent.setDescription("Annual hackathon at Demo College");
        demoEvent.setCategory("Technology");
        demoEvent.setVenue("Auditorium A");
        demoEvent.setStartTime(LocalDateTime.now().plusDays(2));
        demoEvent.setEndTime(LocalDateTime.now().plusDays(3));
        demoEvent.setCapacity(100);
        demoEvent.setOrganizer(admin);
        demoEvent.setCollege(demoCollege);
        demoEvent.setActive(true);
        demoEvent = eventRepository.save(demoEvent);

        // Attempt RSVP from techCollege student to demoCollege event should receive 403 Forbidden
        mockMvc.perform(post("/api/events/" + demoEvent.getId() + "/rsvp")
                        .header("Authorization", "Bearer " + techToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("23. Campus Community post creation, college listing, and comments")
    void testCommunityPostAndComments() throws Exception {
        String studentEmail = "comm_student_" + System.currentTimeMillis() + "@college.edu";
        RegisterRequest reg = new RegisterRequest();
        reg.setFullName("Community Student");
        reg.setEmail(studentEmail);
        reg.setPassword("Password123!");
        reg.setCollegeId(demoCollege.getId());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk());

        String studentToken = obtainToken(studentEmail, "Password123!");

        // Create post
        String postPayload = "{\"title\": \"Question about calculus exam\", \"content\": \"Where can I find past papers?\", \"type\": \"QUESTION\"}";

        MvcResult postRes = mockMvc.perform(post("/api/community/posts")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(postPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Question about calculus exam"))
                .andExpect(jsonPath("$.type").value("QUESTION"))
                .andExpect(jsonPath("$.collegeId").value(demoCollege.getId()))
                .andReturn();

        Long postId = objectMapper.readTree(postRes.getResponse().getContentAsString()).get("id").asLong();

        // List posts
        mockMvc.perform(get("/api/community/posts")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Add comment
        String commentPayload = "{\"content\": \"Check the library portal archive!\"}";
        mockMvc.perform(post("/api/community/posts/" + postId + "/comments")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(commentPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Check the library portal archive!"));

        // Get comments
        mockMvc.perform(get("/api/community/posts/" + postId + "/comments")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("Check the library portal archive!"));
    }

    @Test
    @DisplayName("24. Profile image upload and removal")
    void testProfileImageUploadAndRemoval() throws Exception {
        String testEmail = "img_student_" + System.currentTimeMillis() + "@college.edu";
        RegisterRequest reg = new RegisterRequest();
        reg.setFullName("Avatar Student");
        reg.setEmail(testEmail);
        reg.setPassword("Password123!");
        reg.setCollegeId(demoCollege.getId());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk());

        String studentToken = obtainToken(testEmail, "Password123!");

        // Upload fake image
        MockMultipartFile imageFile = new MockMultipartFile(
                "file",
                "avatar.png",
                "image/png",
                new byte[]{1, 2, 3, 4, 5}
        );

        mockMvc.perform(multipart("/api/users/me/profile-image")
                        .file(imageFile)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileImageUrl").isNotEmpty());

        // Delete profile image
        mockMvc.perform(delete("/api/users/me/profile-image")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileImageUrl").doesNotExist());
    }
}
