package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsResponse {

    private long totalUsers;
    private long totalClubs;
    private long activeClubs;
    private long totalEvents;
    private long activeEvents;
    private long totalTeams;
    private long totalAnnouncements;
    private long activeAnnouncements;
    private long totalOpportunities;
    private long activeOpportunities;
}
