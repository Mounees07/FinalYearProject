package com.academic.platform.controller;

import com.academic.platform.model.Course;
import com.academic.platform.model.Section;
import com.academic.platform.model.Enrollment;
import com.academic.platform.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = { "http://localhost:5173", "http://10.10.188.128:5173" }, allowCredentials = "true")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.createCourse(course));
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean cascade) {
        try {
            courseService.deleteCourse(id, cascade);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/sections")
    public ResponseEntity<Section> createSection(@RequestBody Section section, @RequestParam String facultyUid) {
        return ResponseEntity.ok(courseService.createSection(section, facultyUid));
    }

    @GetMapping("/sections")
    public ResponseEntity<List<Section>> getAllSections() {
        return ResponseEntity.ok(courseService.getAllSections());
    }

    @GetMapping("/sections/faculty/{facultyUid}")
    public ResponseEntity<List<Section>> getFacultySections(@PathVariable String facultyUid) {
        return ResponseEntity.ok(courseService.getSectionsByFaculty(facultyUid));
    }

    @PostMapping("/enroll")
    public ResponseEntity<Enrollment> enrollStudent(@RequestParam Long sectionId, @RequestParam String studentUid) {
        return ResponseEntity.ok(courseService.enrollStudent(sectionId, studentUid));
    }

    @GetMapping("/enrollments/student/{studentUid}")
    public ResponseEntity<List<Enrollment>> getStudentEnrollments(@PathVariable String studentUid) {
        return ResponseEntity.ok(courseService.getStudentEnrollments(studentUid));
    }
}
