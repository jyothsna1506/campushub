package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OpportunityResponse {

    private Long id;
    private String title;
    private String description;
    private String organization;
    private String type;
    private String location;
    private String applicationUrl;
    private LocalDate applicationDeadline;
    private Long postedById;
    private String postedByName;
    private LocalDateTime createdAt;
    private boolean active;
}
