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
public class EventRsvpResponse {

    private Long rsvpId;
    private Long userId;
    private String userFullName;
    private Long eventId;
    private String eventTitle;
    private LocalDateTime registeredAt;
}
