package com.campushub.backend.dto;

import com.campushub.backend.entity.TeamJoinRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeamJoinRequestResponse {

    private Long requestId;
    private Long userId;
    private String userFullName;
    private Long teamId;
    private String teamName;
    private TeamJoinRequestStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
}
