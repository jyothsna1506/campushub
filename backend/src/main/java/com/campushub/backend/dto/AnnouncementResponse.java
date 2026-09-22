package com.campushub.backend.dto;

import com.campushub.backend.entity.AnnouncementPriority;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementResponse {

    private Long id;
    private String title;
    private String content;
    private String category;
    private AnnouncementPriority priority;
    private Long authorId;
    private String authorName;
    private LocalDateTime createdAt;
    private boolean active;
}
