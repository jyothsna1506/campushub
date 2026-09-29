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
public class CommunityCommentResponse {

    private Long id;
    private Long postId;
    private Long authorId;
    private String authorName;
    private String authorProfileImageUrl;
    private String content;
    private LocalDateTime createdAt;
}
