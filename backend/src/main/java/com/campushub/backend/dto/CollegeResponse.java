package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CollegeResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private boolean active;
    private LocalDateTime createdAt;
}
