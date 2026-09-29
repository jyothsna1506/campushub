package com.campushub.backend.controller.admin;

import com.campushub.backend.dto.UpdateUserRoleRequest;
import com.campushub.backend.dto.UserResponse;
import com.campushub.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            Principal principal
    ) {
        return userService.getUsers(search, role, principal.getName());
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id, Principal principal) {
        return userService.getUserResponseById(id, principal.getName());
    }

    @PutMapping("/{id}/role")
    public UserResponse updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            Principal principal
    ) {
        return userService.updateUserRole(id, request.getRole(), principal.getName());
    }
}
