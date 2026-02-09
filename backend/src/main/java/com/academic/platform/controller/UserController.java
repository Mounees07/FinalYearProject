package com.academic.platform.controller;

import com.academic.platform.model.User;
import com.academic.platform.model.Role;
import com.academic.platform.service.UserService;
import com.academic.platform.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PutMapping("/{uid}")
    public ResponseEntity<User> updateUser(@PathVariable String uid, @RequestBody User updates) {
        try {
            return ResponseEntity.ok(userService.updateUser(uid, updates));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{uid}")
    public ResponseEntity<Void> deleteUser(@PathVariable String uid) {
        try {
            userService.deleteUser(uid);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
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

    @GetMapping("/faculty/department")
    public ResponseEntity<List<User>> getFacultyByDepartment(@RequestParam String department) {
        return ResponseEntity.ok(userService.getFacultyByDepartment(department));
    }

    @GetMapping("/students/department")
    public ResponseEntity<List<User>> getStudentsByDepartment(@RequestParam String department) {
        return ResponseEntity.ok(userService.getStudentsByDepartment(department));
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

    @PostMapping("/dev/seed-faculty")
    public ResponseEntity<User> seedFaculty(@RequestParam String department) {
        return ResponseEntity.ok(userService.seedDummyFaculty(department));
    }

    @Autowired
    private com.academic.platform.service.SystemSettingService systemSettingService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        logger.info("Attempting to register user: " + request.getEmail());

        if (!systemSettingService.isRegistrationAllowed()) {
            return ResponseEntity.status(403).body("Registration is currently disabled by administrator.");
        }

        try {
            String currentUid = securityUtils.getCurrentUserUid();

            if (currentUid == null || "anonymousUser".equals(currentUid)) {
                logger.warning("Registration rejected: No valid Firebase token found.");
                return ResponseEntity.status(401).body("Unauthorized: Missing or invalid Firebase ID token");
            }

            if (!currentUid.equals(request.getFirebaseUid())) {
                return ResponseEntity.status(403).body("Unauthorized: UID mismatch");
            }

            String parsedRole = request.getRole() != null ? request.getRole().toUpperCase().trim() : "STUDENT";

            User user = userService.registerUser(
                    request.getFirebaseUid(),
                    request.getEmail(),
                    request.getFullName(),
                    request.getProfilePictureUrl(),
                    Role.valueOf(parsedRole));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.severe("Registration error: " + e.getMessage());
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        try {
            User user = new User();
            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
            try {
                user.setRole(Role.valueOf(request.getRole()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(new MessageResponse("Invalid Role: " + request.getRole()));
            }
            user.setDepartment(request.getDepartment());
            user.setRollNumber(request.getRollNumber());
            // Map other fields as necessary

            return ResponseEntity.ok(userService.createUser(user, request.getPassword()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    public static class CreateUserRequest {
        private String email;
        private String fullName;
        private String role;
        private String department;
        private String rollNumber;
        private String password;

        // Getters and Setters
        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getDepartment() {
            return department;
        }

        public void setDepartment(String department) {
            this.department = department;
        }

        public String getRollNumber() {
            return rollNumber;
        }

        public void setRollNumber(String rollNumber) {
            this.rollNumber = rollNumber;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class UserRegistrationRequest {
        private String firebaseUid;
        private String email;
        private String fullName;
        private String profilePictureUrl;
        private String role;

        public String getFirebaseUid() {
            return firebaseUid;
        }

        public void setFirebaseUid(String firebaseUid) {
            this.firebaseUid = firebaseUid;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getProfilePictureUrl() {
            return profilePictureUrl;
        }

        public void setProfilePictureUrl(String profilePictureUrl) {
            this.profilePictureUrl = profilePictureUrl;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }

    public static class MentorshipRequest {
        private String studentUid;
        private String mentorUid;

        public String getStudentUid() {
            return studentUid;
        }

        public void setStudentUid(String studentUid) {
            this.studentUid = studentUid;
        }

        public String getMentorUid() {
            return mentorUid;
        }

        public void setMentorUid(String mentorUid) {
            this.mentorUid = mentorUid;
        }
    }
}
