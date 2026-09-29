package com.campushub.backend.service;

import com.campushub.backend.dto.CommunityCommentRequest;
import com.campushub.backend.dto.CommunityCommentResponse;
import com.campushub.backend.dto.CommunityPostRequest;
import com.campushub.backend.dto.CommunityPostResponse;
import com.campushub.backend.entity.CommunityComment;
import com.campushub.backend.entity.CommunityPost;
import com.campushub.backend.entity.CommunityPostType;
import com.campushub.backend.entity.User;
import com.campushub.backend.exception.ResourceNotFoundException;
import com.campushub.backend.repository.CommunityCommentRepository;
import com.campushub.backend.repository.CommunityPostRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommunityService {

    private final CommunityPostRepository postRepository;
    private final CommunityCommentRepository commentRepository;
    private final UserRepository userRepository;

    public CommunityService(CommunityPostRepository postRepository,
                            CommunityCommentRepository commentRepository,
                            UserRepository userRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CommunityPostResponse createPost(CommunityPostRequest request, String userEmail) {
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (author.getCollege() == null) {
            throw new IllegalStateException("User does not belong to any college");
        }

        CommunityPost post = new CommunityPost();
        post.setTitle(request.getTitle().trim());
        post.setContent(request.getContent().trim());
        post.setType(request.getType());
        post.setAuthor(author);
        post.setCollege(author.getCollege());
        post.setActive(true);

        CommunityPost savedPost = postRepository.save(post);
        return mapToPostResponse(savedPost, 0);
    }

    public List<CommunityPostResponse> getPosts(CommunityPostType type, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (user.getCollege() == null) {
            return List.of();
        }

        Long collegeId = user.getCollege().getId();
        List<CommunityPost> posts;
        if (type != null) {
            posts = postRepository.findByCollegeIdAndTypeAndActiveTrueOrderByCreatedAtDesc(collegeId, type);
        } else {
            posts = postRepository.findByCollegeIdAndActiveTrueOrderByCreatedAtDesc(collegeId);
        }

        return posts.stream().map(p -> {
            long count = commentRepository.countByPostIdAndActiveTrue(p.getId());
            return mapToPostResponse(p, count);
        }).toList();
    }

    public CommunityPostResponse getPostById(Long id, String userEmail) {
        CommunityPost post = postRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (user.getCollege() != null && post.getCollege() != null) {
            if (!user.getCollege().getId().equals(post.getCollege().getId())) {
                throw new ResourceNotFoundException("Post not found with id: " + id);
            }
        }

        long count = commentRepository.countByPostIdAndActiveTrue(post.getId());
        return mapToPostResponse(post, count);
    }

    @Transactional
    public CommunityPostResponse updatePost(Long id, CommunityPostRequest request, String userEmail) {
        CommunityPost post = postRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        if (!post.getAuthor().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Only the author can edit this post");
        }

        post.setTitle(request.getTitle().trim());
        post.setContent(request.getContent().trim());
        post.setType(request.getType());

        CommunityPost updated = postRepository.save(post);
        long count = commentRepository.countByPostIdAndActiveTrue(post.getId());
        return mapToPostResponse(updated, count);
    }

    @Transactional
    public void deletePost(Long id, String userEmail, boolean isAdmin) {
        CommunityPost post = postRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (!isAdmin && !post.getAuthor().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Only the author or an admin can delete this post");
        }

        if (isAdmin && user.getCollege() != null && post.getCollege() != null) {
            if (!user.getCollege().getId().equals(post.getCollege().getId())) {
                throw new AccessDeniedException("Admins can only delete posts from their own college");
            }
        }

        post.setActive(false);
        postRepository.save(post);
    }

    @Transactional
    public CommunityCommentResponse addComment(Long postId, CommunityCommentRequest request, String userEmail) {
        CommunityPost post = postRepository.findByIdAndActiveTrue(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (author.getCollege() != null && post.getCollege() != null) {
            if (!author.getCollege().getId().equals(post.getCollege().getId())) {
                throw new AccessDeniedException("Cannot comment on posts from another college");
            }
        }

        CommunityComment comment = new CommunityComment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(request.getContent().trim());
        comment.setActive(true);

        CommunityComment saved = commentRepository.save(comment);
        return mapToCommentResponse(saved);
    }

    public List<CommunityCommentResponse> getComments(Long postId, String userEmail) {
        CommunityPost post = postRepository.findByIdAndActiveTrue(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (user.getCollege() != null && post.getCollege() != null) {
            if (!user.getCollege().getId().equals(post.getCollege().getId())) {
                throw new ResourceNotFoundException("Post not found with id: " + postId);
            }
        }

        return commentRepository.findByPostIdAndActiveTrueOrderByCreatedAtAsc(postId).stream()
                .map(this::mapToCommentResponse)
                .toList();
    }

    @Transactional
    public void deleteComment(Long commentId, String userEmail, boolean isAdmin) {
        CommunityComment comment = commentRepository.findByIdAndActiveTrue(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (!isAdmin && !comment.getAuthor().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Only the author or an admin can delete this comment");
        }

        if (isAdmin && user.getCollege() != null && comment.getPost().getCollege() != null) {
            if (!user.getCollege().getId().equals(comment.getPost().getCollege().getId())) {
                throw new AccessDeniedException("Admins can only delete comments from their own college");
            }
        }

        comment.setActive(false);
        commentRepository.save(comment);
    }

    private CommunityPostResponse mapToPostResponse(CommunityPost post, long commentCount) {
        return new CommunityPostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getType(),
                post.getAuthor().getId(),
                post.getAuthor().getFullName(),
                post.getAuthor().getProfileImageUrl(),
                post.getCollege() != null ? post.getCollege().getId() : null,
                post.getCollege() != null ? post.getCollege().getName() : null,
                post.getCreatedAt(),
                post.getUpdatedAt(),
                commentCount,
                post.isActive()
        );
    }

    private CommunityCommentResponse mapToCommentResponse(CommunityComment comment) {
        return new CommunityCommentResponse(
                comment.getId(),
                comment.getPost().getId(),
                comment.getAuthor().getId(),
                comment.getAuthor().getFullName(),
                comment.getAuthor().getProfileImageUrl(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}
