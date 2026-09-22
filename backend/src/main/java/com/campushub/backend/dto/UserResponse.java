package com.campushub.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String program;
    private String branch;
    private Integer year;
    private String bio;
    private String role;
}
