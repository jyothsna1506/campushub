package com.campushub.backend.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private int status;
    private String error;
    private String message;
    private String timestamp;
    private Map<String, String> errors;

    public ErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.timestamp = Instant.now().toString();
    }

    public ErrorResponse(int status, String error, String message, Map<String, String> errors) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.timestamp = Instant.now().toString();
        this.errors = errors;
    }
}
