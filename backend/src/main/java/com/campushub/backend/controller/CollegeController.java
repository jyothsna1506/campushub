package com.campushub.backend.controller;

import com.campushub.backend.dto.CollegeRequest;
import com.campushub.backend.dto.CollegeResponse;
import com.campushub.backend.service.CollegeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/colleges")
public class CollegeController {

    private final CollegeService collegeService;

    public CollegeController(CollegeService collegeService) {
        this.collegeService = collegeService;
    }

    @GetMapping("/active")
    public ResponseEntity<List<CollegeResponse>> getActiveColleges() {
        return ResponseEntity.ok(collegeService.getActiveColleges());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollegeResponse> getCollegeById(@PathVariable Long id) {
        return ResponseEntity.ok(collegeService.getCollegeById(id));
    }

    @GetMapping
    public ResponseEntity<List<CollegeResponse>> getAllColleges() {
        return ResponseEntity.ok(collegeService.getAllColleges());
    }

    @PostMapping
    public ResponseEntity<CollegeResponse> createCollege(@Valid @RequestBody CollegeRequest request) {
        CollegeResponse created = collegeService.createCollege(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CollegeResponse> updateCollege(@PathVariable Long id,
                                                         @Valid @RequestBody CollegeRequest request) {
        return ResponseEntity.ok(collegeService.updateCollege(id, request));
    }
}
