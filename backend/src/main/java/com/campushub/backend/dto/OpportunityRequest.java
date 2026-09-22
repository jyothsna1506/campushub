package com.campushub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class OpportunityRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotBlank(message = "Organization is required")
    @Size(max = 100, message = "Organization must not exceed 100 characters")
    private String organization;

    @NotBlank(message = "Type is required")
    @Size(max = 50, message = "Type must not exceed 50 characters")
    private String type;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;

    @Size(max = 255, message = "Application URL must not exceed 255 characters")
    private String applicationUrl;

    @NotNull(message = "Application deadline is required")
    private LocalDate applicationDeadline;
}
