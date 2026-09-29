package com.campushub.backend.dto;

import com.campushub.backend.entity.CommunityPostType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommunityPostResponse {

    private Long id;
    private String title;
    private String content;
    private CommunityPostType type;
    private Long authorId;
    private String authorName;
    private String authorProfileImageUrl;
    private Long collegeId;
    private String collegeName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long commentCount;
    private boolean active;
}
