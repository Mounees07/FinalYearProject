package com.academic.platform.repository;

import com.academic.platform.model.ExamSeating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamSeatingRepository extends JpaRepository<ExamSeating, Long> {
    List<ExamSeating> findByExamId(Long examId);

    List<ExamSeating> findByVenueId(Long venueId);

    List<ExamSeating> findByStudentId(Long studentId);

    List<ExamSeating> findByStudentFirebaseUid(String firebaseUid);
}
