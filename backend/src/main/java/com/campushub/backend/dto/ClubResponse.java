package com.campushub.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ClubResponse {

    private Long id;
    private String name;
    private String description;
    private String category;
    private String department;
    private String coordinatorName;
    private LocalDateTime createdAt;
    private boolean active;
}
