package com.campushub.backend.dto;

import com.campushub.backend.entity.CommunityPostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CommunityPostRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(min = 5, max = 2000, message = "Content must be between 5 and 2000 characters")
    private String content;

    @NotNull(message = "Post type is required")
    private CommunityPostType type;
}
