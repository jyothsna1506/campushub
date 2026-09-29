package com.campushub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CollegeRequest {

    @NotBlank(message = "College name is required")
    @Size(max = 150, message = "College name must not exceed 150 characters")
    private String name;

    @NotBlank(message = "College code is required")
    @Size(min = 2, max = 30, message = "College code must be between 2 and 30 characters")
    @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "College code must contain only letters, numbers, hyphens, and underscores")
    private String code;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private Boolean active;
}
