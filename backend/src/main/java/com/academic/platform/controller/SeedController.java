package com.academic.platform.controller;

import com.academic.platform.model.*;
import com.academic.platform.repository.*;
import com.academic.platform.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/seed")
@CrossOrigin(origins = { "http://localhost:5173", "http://10.10.188.128:5173" }, allowCredentials = "true")
public class SeedController {

    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private SectionRepository sectionRepository;
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    @Autowired
    private AssignmentRepository assignmentRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseService courseService;

    // A simple endpoint to populate sample LMS data
    @PostMapping("/lms")
    public ResponseEntity<String> seedLmsData(@RequestParam(required = false) String studentUid) {
        StringBuilder logs = new StringBuilder();

        try {
            // 1. Ensure a few courses exist
            createCourseIfNotExists("CS101", "Introduction to Computer Science",
                    "Basics of programming and algorithms.", 4);
            createCourseIfNotExists("CS202", "Data Structures", "Advanced data handling and organization.", 4);
            createCourseIfNotExists("CS303", "Database Systems", "SQL, NoSQL, and normalization techniques.", 3);
            createCourseIfNotExists("CS404", "Artificial Intelligence", "Neural networks and ML basics.", 4);

            logs.append("Courses verified/created.\n");

            // 2. Ensure a Faculty exists (or use a placeholder if none found, but better to
            // find one)
            // For seeding purposes, let's look for any TEACHER, or create a dummy one
            Optional<User> facultyOpt = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.TEACHER)
                    .findFirst();

            User faculty;
            if (facultyOpt.isPresent()) {
                faculty = facultyOpt.get();
                logs.append("Found existing faculty: ").append(faculty.getFullName()).append("\n");
            } else {
                // Create a dummy faculty if none exists (just for structure, though usually
                // Auth would handle this)
                // We'll skip creating a user here to avoid Auth conflicts, and just look for
                // ANY user if no teacher found
                // Or better, error out if no users
                List<User> allUsers = userRepository.findAll();
                if (allUsers.isEmpty())
                    return ResponseEntity.badRequest().body("No users found in DB. Please register a user first.");
                faculty = allUsers.get(0); // Fallback
                logs.append("Using fallback user as faculty: ").append(faculty.getFullName()).append("\n");
            }

            // 3. Create Sections for these courses
            List<Course> courses = courseRepository.findAll();
            List<Section> createdSections = new ArrayList<>();

            for (Course c : courses) {
                // Check if section exists
                List<Section> existing = sectionRepository.findByCourseId(c.getId());
                if (existing.isEmpty()) {
                    Section s = Section.builder()
                            .course(c)
                            .faculty(faculty)
                            .semester("Fall")
                            .year(2025)
                            .build();
                    createdSections.add(sectionRepository.save(s));
                } else {
                    createdSections.addAll(existing);
                }
            }
            logs.append("Sections verified/created.\n");

            // 4. Create Assignments
            for (Section s : createdSections) {
                List<Assignment> existing = assignmentRepository.findBySection(s);
                if (existing.isEmpty()) {
                    // Create 2 assignments per section
                    Assignment a1 = Assignment.builder()
                            .section(s)
                            .title("Assignment 1: " + s.getCourse().getName() + " Basics")
                            .description("Complete the introductory exercises.")
                            .dueDate(LocalDateTime.now().plusDays(7))
                            .maxPoints(100)
                            .build();
                    assignmentRepository.save(a1);

                    Assignment a2 = Assignment.builder()
                            .section(s)
                            .title("Midterm Project")
                            .description("Comprehensive project covering the first half of the syllabus.")
                            .dueDate(LocalDateTime.now().plusDays(30))
                            .maxPoints(200)
                            .build();
                    assignmentRepository.save(a2);
                }
            }
            logs.append("Assignments populated.\n");

            // 5. Enroll the specific student if UID provided
            if (studentUid != null) {
                User student = userRepository.findByFirebaseUid(studentUid).orElse(null);
                if (student != null) {
                    for (Section s : createdSections) {
                        try {
                            if (enrollmentRepository.findByStudentAndSection(student, s).isEmpty()) {
                                courseService.enrollStudent(s.getId(), studentUid);
                                logs.append("Enrolled student ").append(student.getFullName()).append(" in ")
                                        .append(s.getCourse().getCode()).append("\n");
                            }
                        } catch (Exception ignored) {
                        }
                    }
                } else {
                    logs.append("Student UID provided but user not found.\n");
                }
            }

            return ResponseEntity.ok(logs.toString());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Seeding failed: " + e.getMessage());
        }
    }

    private void createCourseIfNotExists(String code, String name, String desc, Integer credits) {
        if (courseRepository.findByCode(code).isEmpty()) {
            Course c = Course.builder()
                    .code(code)
                    .name(name)
                    .description(desc)
                    .credits(credits)
                    .build();
            courseRepository.save(c);
        }
    }
}
