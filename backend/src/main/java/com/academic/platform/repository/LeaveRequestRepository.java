package com.academic.platform.repository;

import com.academic.platform.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStudentFirebaseUid(String studentUid);

    @org.springframework.data.jpa.repository.Query("SELECT l FROM LeaveRequest l WHERE l.student.mentor.firebaseUid = :mentorUid AND (l.parentStatus = 'APPROVED' OR l.parentStatus = 'PENDING')")
    List<LeaveRequest> findByStudentMentorFirebaseUidAndParentStatus(
            @org.springframework.data.repository.query.Param("mentorUid") String mentorUid);

    Optional<LeaveRequest> findByParentActionToken(String token);

    List<LeaveRequest> findByStudentDepartmentOrderByCreatedAtDesc(String department);

    List<LeaveRequest> findByStudentRollNumber(String rollNumber);
}
