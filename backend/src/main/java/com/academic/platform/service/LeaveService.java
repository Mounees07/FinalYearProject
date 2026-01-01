package com.academic.platform.service;

import com.academic.platform.model.LeaveRequest;
import com.academic.platform.model.User;
import com.academic.platform.repository.LeaveRequestRepository;
import com.academic.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Hardcoded for now, should be from properties or env
    private static final String FRONTEND_URL = "http://10.10.188.128:5173";

    public LeaveRequest applyLeave(String studentUid, LeaveRequest request) {
        User student = userRepository.findByFirebaseUid(studentUid)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        request.setStudent(student);
        request.setParentStatus("PENDING");
        request.setMentorStatus("PENDING");
        request.setParentActionToken(UUID.randomUUID().toString());

        LeaveRequest saved = leaveRepository.save(request);

        // Send Email to Parent
        String approvalLink = FRONTEND_URL + "/parent-response/" + saved.getParentActionToken();
        emailService.sendParentApprovalRequest(
                request.getParentEmail(),
                student.getFullName(),
                request.getReason(),
                request.getFromDate().toString(),
                request.getToDate().toString(),
                approvalLink);

        return saved;
    }

    public List<LeaveRequest> getStudentLeaves(String studentUid) {
        return leaveRepository.findByStudentFirebaseUid(studentUid);
    }

    public LeaveRequest getLeaveByToken(String token) {
        return leaveRepository.findByParentActionToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
    }

    public LeaveRequest parentAction(String token, String status) {
        LeaveRequest leave = getLeaveByToken(token);
        if (!leave.getParentStatus().equals("PENDING")) {
            throw new RuntimeException("Request already processed by parent");
        }

        leave.setParentStatus(status); // APPROVED or REJECTED

        if ("REJECTED".equals(status)) {
            leave.setMentorStatus("REJECTED_BY_PARENT");
            emailService.sendStudentLeaveStatus(leave.getStudent().getEmail(), "REJECTED (By Parent)",
                    "Your parent has declined this request.");
        }

        return leaveRepository.save(leave);
    }

    public List<LeaveRequest> getPendingLeavesForMentor(String mentorUid) {
        // Return all leaves where parent has approved, regardless of mentor status
        // (Pending/Approved/Rejected)
        // This allows the mentor to see history.
        return leaveRepository.findByStudentMentorFirebaseUidAndParentStatus(mentorUid, "APPROVED");
    }

    public LeaveRequest mentorAction(Long leaveId, String status, String remarks) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        leave.setMentorStatus(status);
        LeaveRequest saved = leaveRepository.save(leave);

        // Notify Student
        emailService.sendStudentLeaveStatus(leave.getStudent().getEmail(), status, remarks);

        return saved;
    }

    public void deleteLeave(Long leaveId, String studentUid) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        if (!leave.getStudent().getFirebaseUid().equals(studentUid)) {
            throw new RuntimeException("Unauthorized to delete this leave");
        }

        if (!"PENDING".equals(leave.getParentStatus()) && !"PENDING".equals(leave.getMentorStatus())) {
            // Optional: Allow deleting if rejected? For now, restriction to pending/early
            // stage usually safer or just checked logic
        }

        leaveRepository.delete(leave);
    }

    public LeaveRequest updateLeave(Long leaveId, String studentUid, LeaveRequest updatedData) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        if (!leave.getStudent().getFirebaseUid().equals(studentUid)) {
            throw new RuntimeException("Unauthorized to update this leave");
        }

        if (!"PENDING".equals(leave.getParentStatus())) {
            throw new RuntimeException("Cannot edit leave: Parent has already processed it.");
        }

        leave.setLeaveType(updatedData.getLeaveType());
        leave.setFromDate(updatedData.getFromDate());
        leave.setToDate(updatedData.getToDate());
        leave.setReason(updatedData.getReason());
        // If parent email changed, maybe resend email? keeping simple for now

        return leaveRepository.save(leave);
    }
}
