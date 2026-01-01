package com.academic.platform.service;

import com.academic.platform.model.Attendance;
import com.academic.platform.model.User;
import com.academic.platform.repository.AttendanceRepository;
import com.academic.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    public Attendance markAttendance(String studentUid) {
        User student = userRepository.findByFirebaseUid(studentUid)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (attendanceRepository.findByStudentAndDate(student, LocalDate.now()).isPresent()) {
            throw new RuntimeException("Attendance already marked for today.");
        }

        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setDate(LocalDate.now());
        attendance.setCheckInTime(LocalTime.now());
        // Simple logic: Late if after 10:00 AM
        if (LocalTime.now().isAfter(LocalTime.of(10, 0))) {
            attendance.setStatus("LATE");
        } else {
            attendance.setStatus("PRESENT");
        }

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getStudentAttendance(String studentUid) {
        return attendanceRepository.findByStudentFirebaseUidOrderByDateDesc(studentUid);
    }

    public boolean isAttendanceMarkedToday(String studentUid) {
        User student = userRepository.findByFirebaseUid(studentUid)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return attendanceRepository.findByStudentAndDate(student, LocalDate.now()).isPresent();
    }

    public List<Attendance> getMenteesAttendance(String mentorUid, LocalDate date) {
        return attendanceRepository.findByStudentMentorFirebaseUidAndDate(mentorUid,
                date != null ? date : LocalDate.now());
    }
}
