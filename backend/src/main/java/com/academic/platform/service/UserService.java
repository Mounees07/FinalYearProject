package com.academic.platform.service;

import com.academic.platform.model.User;
import com.academic.platform.model.Role;
import com.academic.platform.repository.UserRepository;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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

    private Integer safeParseInt(String value) {
        if (value == null || value.trim().isEmpty())
            return null;
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return null; // Fallback to null if not a number
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
            return existingByUid.get();
        }

        Optional<User> existingByEmail = userRepository.findByEmail(email.toLowerCase());
        if (existingByEmail.isPresent()) {
            User user = existingByEmail.get();
            user.setFirebaseUid(firebaseUid);
            user.setProfilePictureUrl(profilePictureUrl);
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
}
