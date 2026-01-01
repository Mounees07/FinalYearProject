package com.academic.platform.service;

import com.academic.platform.model.*;
import com.academic.platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private UserRepository userRepository;

    public Course createCourse(Course course) {
        if (courseRepository.findByCode(course.getCode()).isPresent()) {
            throw new RuntimeException("Course with code " + course.getCode() + " already exists.");
        }
        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public void deleteCourse(Long courseId, boolean cascade) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        List<Section> sections = sectionRepository.findByCourseId(courseId);

        if (!sections.isEmpty()) {
            if (!cascade) {
                throw new RuntimeException("Cannot delete course. It has " + sections.size() +
                        " active sections. Use force delete to remove all sections and enrollments.");
            }
            // Cascade Delete Logic: Delete Enrollments -> Delete Assignments (and
            // Submissions) -> Delete Sections
            for (Section section : sections) {
                // 1. Delete Enrollments
                List<Enrollment> enrollments = enrollmentRepository.findBySection(section);
                enrollmentRepository.deleteAll(enrollments);

                // 2. Delete Assignments (and their Submissions)
                List<Assignment> assignments = assignmentRepository.findBySection(section);
                for (Assignment assignment : assignments) {
                    List<Submission> submissions = submissionRepository.findByAssignment(assignment);
                    submissionRepository.deleteAll(submissions);
                }
                assignmentRepository.deleteAll(assignments);

                // 3. Delete Announcements
                List<Announcement> announcements = announcementRepository.findByTargetSection(section);
                announcementRepository.deleteAll(announcements);
            }
            // 4. Delete Sections
            sectionRepository.deleteAll(sections);
        }

        courseRepository.delete(course);
    }

    public Section createSection(Section section, String facultyUid) {
        User faculty = userRepository.findByFirebaseUid(facultyUid)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        section.setFaculty(faculty);

        // Check for duplicates
        if (sectionRepository.existsByCourseAndFacultyAndSemesterAndYear(
                section.getCourse(), faculty, section.getSemester(), section.getYear())) {
            throw new RuntimeException("This faculty is already assigned to this course for the selected semester.");
        }

        return sectionRepository.save(section);
    }

    public List<Section> getAllSections() {
        return sectionRepository.findAll();
    }

    public List<Section> getSectionsByFaculty(String facultyUid) {
        User faculty = userRepository.findByFirebaseUid(facultyUid)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        return sectionRepository.findByFaculty(faculty);
    }

    public Enrollment enrollStudent(Long sectionId, String studentUid) {
        Section newSection = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        User student = userRepository.findByFirebaseUid(studentUid)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if student is already enrolled in ANY section of this course
        Optional<Enrollment> existingOpt = enrollmentRepository.findByStudentAndSection_Course(student,
                newSection.getCourse());

        if (existingOpt.isPresent()) {
            Enrollment existing = existingOpt.get();

            // If already enrolled in the SAME section
            if (existing.getSection().getId().equals(newSection.getId())) {
                throw new RuntimeException("Student already enrolled in this faculty");
            }

            // Logic for CHANGING faculty
            int currentChanges = existing.getChangeCount() == null ? 0 : existing.getChangeCount();

            // 1. Check Max Limit (2 changes allowed)
            if (currentChanges >= 2) {
                throw new RuntimeException(
                        "Maximum faculty changes (2) limit reached. You cannot change faculty anymore.");
            }

            // 2. Check 24 hour freeze
            // Use lastUpdatedDate if present, otherwise enrollmentDate
            LocalDateTime referencetime = existing.getLastUpdatedDate() != null ? existing.getLastUpdatedDate()
                    : existing.getEnrollmentDate();

            if (referencetime.plusHours(24).isAfter(LocalDateTime.now())) {
                long hoursLeft = java.time.Duration.between(LocalDateTime.now(), referencetime.plusHours(24)).toHours();
                throw new RuntimeException(
                        "Faculty selection is frozen. You can change again in " + (hoursLeft + 1) + " hours.");
            }

            // Apply Change
            existing.setSection(newSection);
            existing.setChangeCount(currentChanges + 1);
            existing.setLastUpdatedDate(LocalDateTime.now());

            return enrollmentRepository.save(existing);
        }

        // New Enrollment
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .section(newSection)
                .enrollmentDate(LocalDateTime.now())
                .changeCount(0)
                .build();

        return enrollmentRepository.save(enrollment);
    }

    public List<Enrollment> getStudentEnrollments(String studentUid) {
        User student = userRepository.findByFirebaseUid(studentUid)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return enrollmentRepository.findByStudent(student);
    }

    public List<Enrollment> getSectionEnrollments(Long sectionId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        return enrollmentRepository.findBySection(section);
    }
}
