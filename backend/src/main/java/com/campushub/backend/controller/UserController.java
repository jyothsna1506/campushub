package com.campushub.backend.controller;

import com.campushub.backend.dto.RegisterRequest;
import com.campushub.backend.dto.UserResponse;
import com.campushub.backend.dto.UserUpdateRequest;
import com.campushub.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public UserResponse createUser(@Valid @RequestBody RegisterRequest request) {
        return userService.registerUser(request);
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return userService.getUserResponseById(id);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable Long id,
                                   @Valid @RequestBody UserUpdateRequest request,
                                   Principal principal) {
        return userService.updateUser(id, request, principal.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id,
                                                          Principal principal) {
        userService.deleteUser(id, principal.getName());
        return ResponseEntity.ok(Map.of("message", "User deleted successfully!"));
    }
}
