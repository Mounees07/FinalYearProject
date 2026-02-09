package com.academic.platform.service;

import com.academic.platform.dto.DepartmentAnalyticsDTO;
import com.academic.platform.dto.DepartmentDashboardDTO;
import com.academic.platform.model.Role;
import com.academic.platform.model.User;
import com.academic.platform.model.LeaveRequest;
import com.academic.platform.repository.CourseRepository;
import com.academic.platform.repository.LeaveRequestRepository;
import com.academic.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private CourseRepository courseRepository;

        @Autowired
        private LeaveRequestRepository leaveRepository;

        public DepartmentDashboardDTO getDashboardStats(String department) {
                DepartmentDashboardDTO dto = new DepartmentDashboardDTO();

                // 1. Faculty Count
                dto.setTotalFaculty(
                                userRepository.findByDepartmentAndRoleIn(department,
                                                Collections.singletonList(Role.TEACHER)).size());

                // 2. Student Count
                dto.setTotalStudents(
                                userRepository.findByDepartmentAndRoleIn(department,
                                                Collections.singletonList(Role.STUDENT)).size());

                // 3. Course Count
                dto.setTotalCourses(courseRepository.findByDepartment(department).size());

                // 4. Recent Leaves
                List<LeaveRequest> allLeaves = leaveRepository.findByStudentDepartmentOrderByCreatedAtDesc(department);
                dto.setRecentActivities(allLeaves.stream().limit(5).toList());

                dto.setPendingLeaves(allLeaves.stream()
                                .filter(l -> "PENDING".equals(l.getMentorStatus())
                                                || "PENDING".equals(l.getParentStatus()))
                                .count());

                return dto;
        }

        public DepartmentAnalyticsDTO getAnalytics(String department) {
                DepartmentAnalyticsDTO dto = new DepartmentAnalyticsDTO();

                List<User> students = userRepository.findByDepartmentAndRoleIn(department,
                                Collections.singletonList(Role.STUDENT));

                // 1. KPIs
                dto.setActiveStudents(students.size());
                dto.setActiveCourses(courseRepository.findByDepartment(department).size());

                double avgAttendance = students.stream()
                                .mapToDouble(u -> u.getAttendance() != null ? u.getAttendance() : 0.0)
                                .average().orElse(0.0);
                dto.setCurrentAvgAttendance(Math.round(avgAttendance * 10.0) / 10.0);

                double avgGPA = students.stream()
                                .mapToDouble(u -> u.getGpa() != null ? u.getGpa() : 0.0)
                                .average().orElse(0.0);
                dto.setDeptCGPA(Math.round(avgGPA * 100.0) / 100.0);

                // 2. Enrollment Trends (Group by Month - Last 6 months or all)
                // Taking simplistic approach: formatting createdAt to "MMM"
                // Note: Real world would need handling years, etc.
                Map<String, Long> enrollmentMap = students.stream()
                                .filter(u -> u.getCreatedAt() != null)
                                .collect(Collectors.groupingBy(
                                                u -> u.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM")),
                                                Collectors.counting()));

                // Hardcoding a mock list if empty or filling gaps would be better, but let's
                // just map present data
                // To make it look like a trend, we might need to sort by date.
                // For simplicity, let's just return what we have or some basic logic.
                // If data is scarce, this chart might look empty.
                // Let's rely on the fact that we might have seeded data or just show what's
                // there.
                List<DepartmentAnalyticsDTO.EnrollmentTrend> trends = new ArrayList<>();
                enrollmentMap.forEach(
                                (k, v) -> trends.add(new DepartmentAnalyticsDTO.EnrollmentTrend(k, v.intValue())));
                dto.setEnrollmentTrends(trends);

                // 3. Attendance by Year
                Map<Integer, Double> attendanceByYearMap = students.stream()
                                .filter(u -> u.getSemester() != null)
                                .collect(Collectors.groupingBy(
                                                u -> (u.getSemester() + 1) / 2, // Sem 1,2 -> Year 1
                                                Collectors.averagingDouble(
                                                                u -> u.getAttendance() != null ? u.getAttendance()
                                                                                : 0.0)));

                List<DepartmentAnalyticsDTO.AttendanceStats> attStats = new ArrayList<>();
                attendanceByYearMap.forEach(
                                (year, att) -> attStats.add(new DepartmentAnalyticsDTO.AttendanceStats("Year " + year,
                                                Math.round(att * 10.0) / 10.0)));
                dto.setAttendanceByYear(attStats);

                // 4. Performance Distribution
                int distinction = 0, first = 0, second = 0, fail = 0;
                for (User s : students) {
                        double g = s.getGpa() != null ? s.getGpa() : 0.0;
                        if (g >= 8.5)
                                distinction++;
                        else if (g >= 7.0)
                                first++;
                        else if (g >= 5.0)
                                second++;
                        else
                                fail++;
                }
                List<DepartmentAnalyticsDTO.PerformanceDistribution> perfDist = new ArrayList<>();
                perfDist.add(new DepartmentAnalyticsDTO.PerformanceDistribution("Distinction", distinction));
                perfDist.add(new DepartmentAnalyticsDTO.PerformanceDistribution("First Class", first));
                perfDist.add(new DepartmentAnalyticsDTO.PerformanceDistribution("Second Class", second));
                perfDist.add(new DepartmentAnalyticsDTO.PerformanceDistribution("Fail", fail));
                dto.setPerformanceDistribution(perfDist);

                // 5. Top Students
                List<DepartmentAnalyticsDTO.TopStudent> top = students.stream()
                                .sorted(Comparator.comparingDouble((User u) -> u.getGpa() != null ? u.getGpa() : 0.0)
                                                .reversed())
                                .limit(5)
                                .map(u -> new DepartmentAnalyticsDTO.TopStudent(
                                                u.getFullName(),
                                                u.getRollNumber(),
                                                u.getAttendance() != null ? u.getAttendance() : 0.0,
                                                u.getGpa() != null ? u.getGpa() : 0.0))
                                .collect(Collectors.toList());
                dto.setTopStudents(top);

                return dto;
        }
}
