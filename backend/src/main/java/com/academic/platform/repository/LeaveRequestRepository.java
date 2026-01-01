package com.academic.platform.repository;

import com.academic.platform.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStudentFirebaseUid(String studentUid);

    List<LeaveRequest> findByStudentMentorFirebaseUidAndParentStatus(String mentorUid, String parentStatus);

    Optional<LeaveRequest> findByParentActionToken(String token);
}
