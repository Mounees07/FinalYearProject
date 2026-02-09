package com.academic.platform.controller;

import com.academic.platform.model.LeaveRequest;
import com.academic.platform.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private com.academic.platform.service.SystemSettingService systemSettingService;

    @PostMapping("/apply")
    public ResponseEntity<?> applyLeave(
            @RequestParam String studentUid,
            @RequestBody LeaveRequest request) {

        if ("false".equalsIgnoreCase(systemSettingService.getSetting("feature.leave.enabled"))) {
            return ResponseEntity.status(403).body("Leave module is currently disabled by administrator.");
        }

        return ResponseEntity.ok(leaveService.applyLeave(studentUid, request));
    }

    @GetMapping("/student/{studentUid}")
    public ResponseEntity<List<LeaveRequest>> getStudentLeaves(@PathVariable String studentUid) {
        return ResponseEntity.ok(leaveService.getStudentLeaves(studentUid));
    }

    // Public endpoint for parent to view details via token
    @GetMapping("/parent-view/{token}")
    public ResponseEntity<LeaveRequest> getLeaveByToken(@PathVariable String token) {
        return ResponseEntity.ok(leaveService.getLeaveByToken(token));
    }

    // Public endpoint for parent action
    @PostMapping("/parent-action/{token}")
    public ResponseEntity<LeaveRequest> parentAction(
            @PathVariable String token,
            @RequestParam String status) {
        return ResponseEntity.ok(leaveService.parentAction(token, status));
    }

    @GetMapping("/mentor/{mentorUid}")
    public ResponseEntity<List<LeaveRequest>> getMentorPendingLeaves(@PathVariable String mentorUid) {
        return ResponseEntity.ok(leaveService.getPendingLeavesForMentor(mentorUid));
    }

    @PostMapping("/mentor-action/{leaveId}")
    public ResponseEntity<LeaveRequest> mentorAction(
            @PathVariable Long leaveId,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        String remarks = payload.get("remarks");
        return ResponseEntity.ok(leaveService.mentorAction(leaveId, status, remarks));
    }

    @DeleteMapping("/{leaveId}")
    public ResponseEntity<Void> deleteLeave(@PathVariable Long leaveId, @RequestParam String studentUid) {
        leaveService.deleteLeave(leaveId, studentUid);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{leaveId}")
    public ResponseEntity<LeaveRequest> updateLeave(
            @PathVariable Long leaveId,
            @RequestParam String studentUid,
            @RequestBody LeaveRequest request) {
        return ResponseEntity.ok(leaveService.updateLeave(leaveId, studentUid, request));
    }

    @PostMapping("/{leaveId}/generate-otp")
    public ResponseEntity<Void> generateOtp(
            @PathVariable Long leaveId,
            @RequestParam String mentorUid) {
        leaveService.generateOtpForApproval(leaveId, mentorUid);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{leaveId}/verify-otp")
    public ResponseEntity<LeaveRequest> verifyOtp(
            @PathVariable Long leaveId,
            @RequestParam String mentorUid,
            @RequestBody Map<String, String> payload) {
        String otp = payload.get("otp");
        String remarks = payload.get("remarks");
        return ResponseEntity.ok(leaveService.verifyOtpAndApprove(leaveId, otp, mentorUid, remarks));
    }

    @PostMapping("/test-email")
    public ResponseEntity<String> testEmail(@RequestParam String email) {
        leaveService.testEmail(email);
        return ResponseEntity.ok("Test email sent to " + email);
    }

    @GetMapping("/security/active/{rollNumber}")
    public ResponseEntity<LeaveRequest> getActiveLeaveForStudent(@PathVariable String rollNumber) {
        LeaveRequest leave = leaveService.getActiveLeaveForStudent(rollNumber);
        if (leave == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(leave);
    }

    @PostMapping("/security/{leaveId}/action")
    public ResponseEntity<LeaveRequest> securityAction(
            @PathVariable Long leaveId,
            @RequestParam String action) {
        return ResponseEntity.ok(leaveService.updateSecurityExitEntry(leaveId, action));
    }
}
