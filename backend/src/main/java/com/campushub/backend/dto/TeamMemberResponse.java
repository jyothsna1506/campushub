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
public class TeamMemberResponse {

    private Long membershipId;
    private Long userId;
    private String userFullName;
    private Long teamId;
    private String teamName;
    private LocalDateTime joinedAt;
}
