package com.campushub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 254, message = "Email must not exceed 254 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
    private String password;

    @Size(max = 50, message = "Program must not exceed 50 characters")
    private String program;

    @Size(max = 100, message = "Branch must not exceed 100 characters")
    private String branch;

    @Min(value = 1, message = "Year must be at least 1")
    @Max(value = 10, message = "Year must not exceed 10")
    private Integer year;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;
}
