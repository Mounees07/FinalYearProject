package com.academic.platform.repository;

import com.academic.platform.model.Attendance;
import com.academic.platform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByStudentAndDate(User student, LocalDate date);

    List<Attendance> findByStudentFirebaseUidOrderByDateDesc(String studentUid);

    // Using a reliable query method name or custom query
    List<Attendance> findByStudentMentorFirebaseUidAndDate(String mentorUid, LocalDate date);
}
