package com.academic.platform.controller;

import com.academic.platform.model.User;
import com.academic.platform.model.Role;
import com.academic.platform.service.UserService;
import com.academic.platform.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import lombok.Data;
import java.util.Optional;
import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = Logger.getLogger(UserController.class.getName());

    @Autowired
    private UserService userService;

    @Autowired
    private SecurityUtils securityUtils;

    @GetMapping("/{uid}")
    public ResponseEntity<User> getUserByUid(@PathVariable String uid) {
        logger.info("Fetching user profile for UID: " + uid);
        Optional<User> user = userService.getUserByFirebaseUid(uid);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    @GetMapping("/faculty")
    public ResponseEntity<List<User>> getAllFaculty() {
        return ResponseEntity.ok(userService.getPotentialFaculty());
    }

    @GetMapping("/mentees/{mentorUid}")
    public ResponseEntity<List<User>> getMentees(@PathVariable String mentorUid) {
        return ResponseEntity.ok(userService.getMenteesByMentor(mentorUid));
    }

    @PostMapping("/assign-mentor")
    public ResponseEntity<?> assignMentor(@RequestBody MentorshipRequest request) {
        try {
            User updated = userService.assignMentor(request.getStudentUid(), request.getMentorUid());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/bulk-assign-mentor")
    public ResponseEntity<List<String>> bulkAssignMentors(@RequestParam("file") MultipartFile file) {
        try {
            List<String> logs = userService.bulkAssignMentors(file.getInputStream());
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(List.of("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/bulk-register")
    public ResponseEntity<List<String>> bulkRegister(@RequestParam("file") MultipartFile file,
            @RequestParam("role") Role role) {
        try {
            List<String> logs = userService.bulkRegisterUsers(file.getInputStream(), role);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(List.of("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/bulk-upload-mentees/{mentorUid}")
    public ResponseEntity<List<String>> bulkUploadMentees(@PathVariable String mentorUid,
            @RequestParam("file") MultipartFile file) {
        try {
            List<String> logs = userService.bulkUploadMenteesForMentor(file.getInputStream(), mentorUid);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(List.of("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        logger.info("Attempting to register user: " + request.getEmail());
        try {
            String currentUid = securityUtils.getCurrentUserUid();

            if (currentUid == null || "anonymousUser".equals(currentUid)) {
                logger.warning("Registration rejected: No valid Firebase token found.");
                return ResponseEntity.status(401).body("Unauthorized: Missing or invalid Firebase ID token");
            }

            if (!currentUid.equals(request.getFirebaseUid())) {
                return ResponseEntity.status(403).body("Unauthorized: UID mismatch");
            }

            User user = userService.registerUser(
                    request.getFirebaseUid(),
                    request.getEmail(),
                    request.getFullName(),
                    request.getProfilePictureUrl(),
                    Role.valueOf(request.getRole() != null ? request.getRole() : "STUDENT"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.severe("Registration error: " + e.getMessage());
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    @Data
    public static class UserRegistrationRequest {
        private String firebaseUid;
        private String email;
        private String fullName;
        private String profilePictureUrl;
        private String role;
    }

    @Data
    public static class MentorshipRequest {
        private String studentUid;
        private String mentorUid;
    }
}
