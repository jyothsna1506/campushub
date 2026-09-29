package com.campushub.backend;

import com.campushub.backend.dto.LoginRequest;
import com.campushub.backend.dto.RegisterRequest;
import com.campushub.backend.entity.User;
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
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Date;

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
    private UserService userService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
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

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STUDENT"));

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

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk());

        String studentToken = obtainToken(testEmail, "Password123!");

        mockMvc.perform(get("/api/admin/dashboard/stats")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("6 & 7. Admin login and admin endpoints return 200 OK")
    void testAdminLoginAndAdminEndpoints() throws Exception {
        String adminToken = obtainToken("admin@college.edu", "Admin@123");
        assertThat(adminToken).isNotEmpty();

        mockMvc.perform(get("/api/admin/dashboard/stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").exists())
                .andExpect(jsonPath("$.totalClubs").exists());
    }

    @Test
    @DisplayName("8. Invalid credentials return 401 Unauthorized without leaking email existence")
    void testInvalidCredentials() throws Exception {
        LoginRequest wrongPw = new LoginRequest();
        wrongPw.setEmail("admin@college.edu");
        wrongPw.setPassword("WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongPw)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));

        LoginRequest nonexistent = new LoginRequest();
        nonexistent.setEmail("nonexistent_" + System.currentTimeMillis() + "@college.edu");
        nonexistent.setPassword("AnyPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nonexistent)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("9. Invalid JWT returns 401 Unauthorized")
    void testInvalidJwt() throws Exception {
        mockMvc.perform(get("/api/clubs")
                        .header("Authorization", "Bearer invalid.malformed.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("10. Expired JWT returns 401 Unauthorized")
    void testExpiredJwt() throws Exception {
        String expiredToken = io.jsonwebtoken.Jwts.builder()
                .subject("admin@college.edu")
                .issuedAt(new Date(System.currentTimeMillis() - 20000))
                .expiration(new Date(System.currentTimeMillis() - 10000))
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970".getBytes()))
                .compact();

        mockMvc.perform(get("/api/clubs")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("11. Registration cannot set role; role is forced to STUDENT")
    void testRegistrationForcedStudent() throws Exception {
        String testEmail = "test_force_student_" + System.currentTimeMillis() + "@college.edu";
        String payload = "{\"fullName\":\"Student Test\",\"email\":\"" + testEmail + "\",\"password\":\"Password123!\",\"role\":\"ADMIN\"}";

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test
    @DisplayName("12. Profile update cannot modify role")
    void testProfileUpdateCannotChangeRole() throws Exception {
        String testEmail = "test_profile_update_" + System.currentTimeMillis() + "@college.edu";
        RegisterRequest reg = new RegisterRequest();
        reg.setFullName("Profile Test");
        reg.setEmail(testEmail);
        reg.setPassword("Password123!");

        MvcResult res = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode userJson = objectMapper.readTree(res.getResponse().getContentAsString());
        Long userId = userJson.get("id").asLong();

        String token = obtainToken(testEmail, "Password123!");

        String updatePayload = "{\"fullName\":\"Updated Name\",\"role\":\"ADMIN\"}";

        mockMvc.perform(put("/api/users/" + userId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Name"))
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test
    @DisplayName("13. Last-admin protection prevents removing the last administrator")
    void testLastAdminProtection() {
        User admin = userRepository.findByEmail("admin@college.edu")
                .orElseThrow();

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
}
