package com.academic.platform.repository;

import com.academic.platform.model.User;
import com.academic.platform.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByFirebaseUid(String firebaseUid);

    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByRoleIn(List<Role> roles);

    List<User> findByMentorFirebaseUid(String mentorUid);

    List<User> findByDepartment(String department);

    List<User> findByDepartmentAndSemester(String department, Integer semester);

    List<User> findByDepartmentAndRoleIn(String department, List<Role> roles);

    List<User> findByDepartmentIgnoreCaseAndRoleIn(String department, List<Role> roles);

    Optional<User> findByRollNumber(String rollNumber);

    List<User> findByRollNumberBetween(String start, String end);
}
