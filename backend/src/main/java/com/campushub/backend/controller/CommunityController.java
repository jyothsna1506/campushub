package com.campushub.backend.controller;

import com.campushub.backend.dto.CommunityCommentRequest;
import com.campushub.backend.dto.CommunityCommentResponse;
import com.campushub.backend.dto.CommunityPostRequest;
import com.campushub.backend.dto.CommunityPostResponse;
import com.campushub.backend.entity.CommunityPostType;
import com.campushub.backend.service.CommunityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @PostMapping("/posts")
    public ResponseEntity<CommunityPostResponse> createPost(@Valid @RequestBody CommunityPostRequest request,
                                                           Principal principal) {
        CommunityPostResponse response = communityService.createPost(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/posts")
    public ResponseEntity<List<CommunityPostResponse>> getPosts(@RequestParam(required = false) CommunityPostType type,
                                                               Principal principal) {
        return ResponseEntity.ok(communityService.getPosts(type, principal.getName()));
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<CommunityPostResponse> getPostById(@PathVariable Long id,
                                                            Principal principal) {
        return ResponseEntity.ok(communityService.getPostById(id, principal.getName()));
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<CommunityPostResponse> updatePost(@PathVariable Long id,
                                                           @Valid @RequestBody CommunityPostRequest request,
                                                           Principal principal) {
        return ResponseEntity.ok(communityService.updatePost(id, request, principal.getName()));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable Long id,
                                                          Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        communityService.deletePost(id, authentication.getName(), isAdmin);
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommunityCommentResponse> addComment(@PathVariable Long postId,
                                                               @Valid @RequestBody CommunityCommentRequest request,
                                                               Principal principal) {
        CommunityCommentResponse response = communityService.addComment(postId, request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommunityCommentResponse>> getComments(@PathVariable Long postId,
                                                                      Principal principal) {
        return ResponseEntity.ok(communityService.getComments(postId, principal.getName()));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Map<String, String>> deleteComment(@PathVariable Long commentId,
                                                             Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        communityService.deleteComment(commentId, authentication.getName(), isAdmin);
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }
}
