package com.campushub.backend.repository;

import com.campushub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    long countByRole(String role);

    List<User> findByRole(String role);

    List<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);

    List<User> findByRoleAndFullNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
            String role1, String name, String role2, String email);

    long countByCollegeId(Long collegeId);

    long countByCollegeIdAndRole(Long collegeId, String role);

    List<User> findByCollegeId(Long collegeId);

    List<User> findByCollegeIdAndRole(Long collegeId, String role);

    Optional<User> findByIdAndCollegeId(Long id, Long collegeId);
}