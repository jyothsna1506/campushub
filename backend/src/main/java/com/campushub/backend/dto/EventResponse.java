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
public class EventResponse {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String venue;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long organizerId;
    private String organizerName;
    private Integer capacity;
    private LocalDateTime createdAt;
    private boolean active;
}
