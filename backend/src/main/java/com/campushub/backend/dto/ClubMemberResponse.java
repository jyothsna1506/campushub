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
public class ClubMemberResponse {

    private Long membershipId;
    private Long userId;
    private String userFullName;
    private Long clubId;
    private String clubName;
    private LocalDateTime joinedAt;
}
