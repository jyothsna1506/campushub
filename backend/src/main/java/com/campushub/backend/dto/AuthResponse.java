package com.campushub.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AuthResponse {

    private String token;
    private String type;
    private UserResponse user;
}
