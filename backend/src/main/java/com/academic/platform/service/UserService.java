package com.academic.platform.service;

import com.academic.platform.model.User;
import com.academic.platform.model.Role;
import com.academic.platform.repository.UserRepository;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> getUserByFirebaseUid(String uid) {
        return userRepository.findByFirebaseUid(uid);
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public List<User> getPotentialFaculty() {
        return userRepository.findByRoleIn(List.of(Role.TEACHER, Role.MENTOR));
    }

    public List<User> getMenteesByMentor(String mentorUid) {
        return userRepository.findByMentorFirebaseUid(mentorUid);
    }

    public List<User> getFacultyByDepartment(String department) {
        return userRepository.findByDepartmentIgnoreCaseAndRoleIn(department, List.of(Role.TEACHER, Role.MENTOR));
    }

    public List<User> getStudentsByDepartment(String department) {
        return userRepository.findByDepartmentIgnoreCaseAndRoleIn(department, List.of(Role.STUDENT));
    }

    private Integer safeParseInt(String value) {
        if (value == null || value.trim().isEmpty())
            return null;
        String cleaned = value.trim().toUpperCase();

        // Handle common prefixes
        cleaned = cleaned.replace("SEM", "").replace("SEMESTER", "").trim();

        try {
            return Integer.parseInt(cleaned);
        } catch (NumberFormatException e) {
            // Handle Roman Numerals common in Indian Universities
            switch (cleaned) {
                case "I":
                    return 1;
                case "II":
                    return 2;
                case "III":
                    return 3;
                case "IV":
                    return 4;
                case "V":
                    return 5;
                case "VI":
                    return 6;
                case "VII":
                    return 7;
                case "VIII":
                    return 8;
                default:
                    return null;
            }
        }
    }

    public List<String> bulkUploadMenteesForMentor(InputStream inputStream, String mentorUid) {
        List<String> logs = new ArrayList<>();
        User mentor = userRepository.findByFirebaseUid(mentorUid)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        try (CSVReader reader = new CSVReaderBuilder(new InputStreamReader(inputStream)).withSkipLines(1).build()) {
            String[] line;
            while ((line = reader.readNext()) != null) {
                try {
                    if (line.length < 2)
                        continue;
                    String fullName = line[0].trim();
                    String email = line[1].trim().toLowerCase();
                    String rollNo = (line.length > 2) ? line[2].trim() : null;
                    String dept = (line.length > 3) ? line[3].trim() : null;
                    Integer sem = (line.length > 4) ? safeParseInt(line[4]) : null;
                    String sec = (line.length > 5) ? line[5].trim() : null;

                    User student;
                    Optional<User> existing = userRepository.findByEmail(email);
                    if (existing.isEmpty()) {
                        student = User.builder()
                                .fullName(fullName)
                                .email(email)
                                .role(Role.STUDENT)
                                .rollNumber(rollNo)
                                .department(dept)
                                .semester(sem)
                                .section(sec)
                                .firebaseUid("PRE_REG_" + email)
                                .mentor(mentor)
                                .build();
                        logs.add("✅ Created & Assigned: " + email);
                    } else {
                        student = existing.get();
                        student.setMentor(mentor);
                        if (rollNo != null)
                            student.setRollNumber(rollNo);
                        if (dept != null)
                            student.setDepartment(dept);
                        if (sem != null)
                            student.setSemester(sem);
                        if (sec != null)
                            student.setSection(sec);
                        logs.add("🔗 Assigned existing: " + email);
                    }
                    userRepository.save(student);
                } catch (Exception rowEx) {
                    logs.add("❌ Row Error (" + (line.length > 1 ? line[1] : "unknown") + "): " + rowEx.getMessage());
                }
            }
        } catch (Exception e) {
            logs.add("❗ Critical File Error: " + e.getMessage());
        }
        return logs;
    }

    public List<String> bulkAssignMentors(InputStream inputStream) {
        List<String> logs = new ArrayList<>();
        try (CSVReader reader = new CSVReaderBuilder(new InputStreamReader(inputStream)).withSkipLines(1).build()) {
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (line.length < 2)
                    continue;
                String studentEmail = line[0].trim().toLowerCase();
                String mentorEmail = line[1].trim().toLowerCase();

                Optional<User> studentOpt = userRepository.findByEmail(studentEmail);
                Optional<User> mentorOpt = userRepository.findByEmail(mentorEmail);

                if (studentOpt.isPresent() && mentorOpt.isPresent()) {
                    User student = studentOpt.get();
                    student.setMentor(mentorOpt.get());
                    userRepository.save(student);
                    logs.add("✅ Mapped " + studentEmail + " to " + mentorEmail);
                } else {
                    logs.add("❌ Failed: " + (studentOpt.isEmpty() ? "Student " : "Mentor ") + studentEmail
                            + " not found.");
                }
            }
        } catch (Exception e) {
            logs.add("❗ Error: " + e.getMessage());
        }
        return logs;
    }

    public List<String> bulkRegisterUsers(InputStream inputStream, Role role) {
        List<String> logs = new ArrayList<>();
        try (CSVReader reader = new CSVReaderBuilder(new InputStreamReader(inputStream)).withSkipLines(1).build()) {
            String[] line;
            while ((line = reader.readNext()) != null) {
                try {
                    if (line.length < 2)
                        continue;
                    String fullName = line[0].trim();
                    String email = line[1].trim().toLowerCase();
                    String rollNo = (line.length > 2) ? line[2].trim() : null;
                    String dept = (line.length > 3) ? line[3].trim() : null;
                    Integer sem = (line.length > 4) ? safeParseInt(line[4]) : null;
                    String sec = (line.length > 5) ? line[5].trim() : null;

                    Optional<User> existing = userRepository.findByEmail(email);
                    if (existing.isEmpty()) {
                        User newUser = User.builder()
                                .fullName(fullName)
                                .email(email)
                                .role(role)
                                .rollNumber(rollNo)
                                .department(dept)
                                .semester(sem)
                                .section(sec)
                                .firebaseUid("PRE_REG_" + email)
                                .build();
                        userRepository.save(newUser);
                        logs.add("✅ Registered: " + email);
                    } else {
                        logs.add("ℹ️ Skipped: " + email + " (Already exists)");
                    }
                } catch (Exception rowEx) {
                    logs.add("❌ Row Error (" + (line.length > 1 ? line[1] : "unknown") + "): " + rowEx.getMessage());
                }
            }
        } catch (Exception e) {
            logs.add("❗ Critical File Error: " + e.getMessage());
        }
        return logs;
    }

    public User assignMentor(String studentUid, String mentorUid) {
        User student = userRepository.findByFirebaseUid(studentUid)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        User mentor = userRepository.findByFirebaseUid(mentorUid)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        student.setMentor(mentor);
        return userRepository.save(student);
    }

    public User registerUser(String firebaseUid, String email, String fullName, String profilePictureUrl, Role role) {
        Optional<User> existingByUid = userRepository.findByFirebaseUid(firebaseUid);
        if (existingByUid.isPresent()) {
            User user = existingByUid.get();
            // Update role if user already exists and role is different or null
            if (role != null && user.getRole() != role) {
                user.setRole(role);
                return userRepository.save(user);
            }
            return user;
        }

        Optional<User> existingByEmail = userRepository.findByEmail(email.toLowerCase());
        if (existingByEmail.isPresent()) {
            User user = existingByEmail.get();
            user.setFirebaseUid(firebaseUid);
            user.setProfilePictureUrl(profilePictureUrl);
            user.setRole(role);
            if (fullName != null && !fullName.isEmpty())
                user.setFullName(fullName);
            return userRepository.save(user);
        }

        User user = User.builder()
                .firebaseUid(firebaseUid)
                .email(email.toLowerCase())
                .fullName(fullName)
                .profilePictureUrl(profilePictureUrl)
                .role(role)
                .build();
        return userRepository.save(user);
    }

    public User updateUser(String uid, User updates) {
        User user = userRepository.findByFirebaseUid(uid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.getFullName() != null)
            user.setFullName(updates.getFullName());
        if (updates.getRollNumber() != null)
            user.setRollNumber(updates.getRollNumber());
        if (updates.getDepartment() != null)
            user.setDepartment(updates.getDepartment());
        if (updates.getSemester() != null)
            user.setSemester(updates.getSemester());
        if (updates.getSection() != null)
            user.setSection(updates.getSection());
        if (updates.getGpa() != null)
            user.setGpa(updates.getGpa());
        if (updates.getAttendance() != null)
            user.setAttendance(updates.getAttendance());
        if (updates.getRole() != null)
            user.setRole(updates.getRole());

        return userRepository.save(user);
    }

    public void deleteUser(String uid) {
        User user = userRepository.findByFirebaseUid(uid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    public User createUser(User user, String password) throws Exception {
        Optional<User> existing = userRepository.findByEmail(user.getEmail().toLowerCase());
        if (existing.isPresent()) {
            throw new RuntimeException("User with this email already exists in Database");
        }

        // Create in Firebase Auth
        try {
            com.google.firebase.auth.UserRecord.CreateRequest request = new com.google.firebase.auth.UserRecord.CreateRequest()
                    .setEmail(user.getEmail())
                    .setDisplayName(user.getFullName())
                    .setPassword(password)
                    .setEmailVerified(true); // Auto-verify email for admin-created users

            com.google.firebase.auth.UserRecord userRecord = com.google.firebase.auth.FirebaseAuth.getInstance()
                    .createUser(request);

            user.setFirebaseUid(userRecord.getUid());
            user.setEmail(user.getEmail().toLowerCase());

            // Set custom claims for role if needed, or rely on our DB role source of truth.
            // For completeness, we could set custom claims, but our frontend checks DB.

            return userRepository.save(user);

        } catch (com.google.firebase.auth.FirebaseAuthException e) {
            throw new RuntimeException("Firebase Auth Error: " + e.getMessage());
        }
    }

    public User seedDummyFaculty(String department) {
        String email = "faculty." + department.toLowerCase().replaceAll("\\s+", "") + "@example.com";
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent())
            return existing.get();

        User dummy = User.builder()
                .email(email)
                .fullName("Dr. Demo Faculty (" + department + ")")
                .role(Role.TEACHER)
                .department(department)
                .firebaseUid("dummy_faculty_" + System.currentTimeMillis())
                .build();
        return userRepository.save(dummy);
    }
}
