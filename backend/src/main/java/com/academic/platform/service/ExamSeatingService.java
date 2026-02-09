package com.academic.platform.service;

import com.academic.platform.model.*;
import com.academic.platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExamSeatingService {

    @Autowired
    private ExamSeatingRepository examSeatingRepository;

    @Autowired
    private AcademicScheduleRepository academicScheduleRepository;

    @Autowired
    private ExamVenueRepository examVenueRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public List<ExamSeating> processSeatingUpload(Long examId, MultipartFile file) throws Exception {
        AcademicSchedule exam = academicScheduleRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        // Pre-fetch all venues for lookup
        List<ExamVenue> allVenues = examVenueRepository.findAll();
        Map<String, ExamVenue> venueMap = allVenues.stream()
                .collect(Collectors.toMap(v -> v.getName().trim().toLowerCase(), v -> v, (v1, v2) -> v1));

        List<ExamSeating> allocations = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int lineNum = 0;
            while ((line = reader.readLine()) != null) {
                lineNum++;
                // Handle BOM
                if (lineNum == 1 && line.startsWith("\uFEFF")) {
                    line = line.substring(1);
                }

                if (line.trim().isEmpty())
                    continue;

                System.out.println("Processing Line " + lineNum + ": " + line); // Debug log

                // Support comma or semicolon
                String[] parts = line.split("[,;]");
                // Expect at least RollNo, VenueName
                if (parts.length < 2) {
                    continue;
                }

                String rollNoInput = parts[0].trim();
                String venueName = parts[1].trim();
                String seatNo = parts.length > 2 ? parts[2].trim() : null;

                if (rollNoInput.isEmpty() || rollNoInput.toLowerCase().startsWith("roll"))
                    continue; // Skip header

                // 1. Resolve Venue (Auto-create if missing to be helpful)
                ExamVenue venue = venueMap.get(venueName.toLowerCase());
                if (venue == null) {
                    System.out.println("Auto-creating missing venue: " + venueName);
                    venue = new ExamVenue();
                    venue.setName(venueName);
                    venue.setBlock("Allocated Block"); // Default
                    venue.setCapacity(100); // Default
                    venue.setExamType("All");
                    venue.setAvailable(true);
                    venue = examVenueRepository.save(venue);
                    venueMap.put(venueName.toLowerCase(), venue); // Update cache
                }

                // 2. Resolve Students (Single or Range)
                List<User> students = new ArrayList<>();

                // Check if range
                String[] rangeParts = rollNoInput.split("[-=]");
                if (rangeParts.length == 2) {
                    String start = rangeParts[0].trim();
                    String end = rangeParts[1].trim();
                    // Use repository BETWEEN logic
                    List<User> rangeStudents = userRepository.findByRollNumberBetween(start, end);
                    if (rangeStudents.isEmpty()) {
                        errors.add("Line " + lineNum + ": No students found in range " + start + " to " + end);
                    } else {
                        students.addAll(rangeStudents);
                    }
                } else {
                    // Single student
                    User s = userRepository.findByRollNumber(rollNoInput).orElse(null);
                    if (s == null) {
                        errors.add("Line " + lineNum + ": Student " + rollNoInput + " not found.");
                    } else {
                        students.add(s);
                    }
                }

                // 3. Create Seating for all found students
                for (User student : students) {
                    ExamSeating seating = ExamSeating.builder()
                            .exam(exam)
                            .venue(venue)
                            .student(student)
                            .seatNumber(seatNo) // Note: seatNo might overlap for range, usually range implies auto-seat
                                                // but we keep it simple
                            .build();
                    allocations.add(seating);
                }
            }
        }

        if (!errors.isEmpty()) {
            String errorMsg = errors.stream().limit(5).collect(Collectors.joining("; "));
            if (errors.size() > 5)
                errorMsg += "... (" + (errors.size() - 5) + " more errors)";
            throw new RuntimeException("Validation failed. Errors: " + errorMsg);
        }

        if (allocations.isEmpty()) {
            throw new RuntimeException("No valid data found in CSV. Check format.");
        }

        // Clean up OLD allocations for this exam to allow re-upload (Idempotency)
        List<ExamSeating> existing = examSeatingRepository.findByExamId(examId);
        if (!existing.isEmpty()) {
            examSeatingRepository.deleteAll(existing);
        }

        return examSeatingRepository.saveAll(allocations);
    }

    public List<ExamSeating> getSeatingByExam(Long examId) {
        return examSeatingRepository.findByExamId(examId);
    }

    public List<ExamSeating> getSeatingByStudent(Long studentId) {
        return examSeatingRepository.findByStudentId(studentId);
    }

    public List<ExamSeating> getSeatingByStudentUid(String uid) {
        return examSeatingRepository.findByStudentFirebaseUid(uid);
    }

    public List<ExamSeating> getAllAllocations() {
        return examSeatingRepository.findAll();
    }
}
