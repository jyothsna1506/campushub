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
public class TeamResponse {

    private Long id;
    private String name;
    private String description;
    private String category;
    private Long ownerId;
    private String ownerName;
    private LocalDateTime createdAt;
    private boolean openForMembers;
}
