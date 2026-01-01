package com.academic.platform.service;

import com.academic.platform.model.AcademicSchedule;
import com.academic.platform.model.User;
import com.academic.platform.repository.AcademicScheduleRepository;
import com.academic.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class AcademicScheduleService {

    @Autowired
    private AcademicScheduleRepository scheduleRepository;

    @Autowired
    private UserRepository userRepository;

    public List<AcademicSchedule> getAllUpcomingSchedules() {
        // Fetch schedules from 1 year ago up to future to ensure current semester
        // visibility
        return scheduleRepository.findByDateAfterOrderByDateAsc(LocalDate.now().minusYears(1));
    }

    public List<AcademicSchedule> processBulkUpload(MultipartFile file, String hodUid) {
        User hod = userRepository.findByFirebaseUid(hodUid)
                .orElseThrow(() -> new RuntimeException("HOD not found"));

        // Allow ADMIN or HOD
        // if (!"HOD".equals(hod.getRole().name())) {
        // throw new RuntimeException("Unauthorized: Only HOD can upload schedules.");
        // }

        List<AcademicSchedule> schedules = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean firstLine = true;
            int lineNum = 0;

            while ((line = br.readLine()) != null) {
                lineNum++;
                if (firstLine) {
                    firstLine = false;
                    continue; // Skip header
                }

                if (line.trim().isEmpty())
                    continue;

                try {
                    // Use -1 limit to preserve trailing empty strings
                    String[] data = line.split(",", -1);
                    if (data.length < 3) {
                        System.out.println("Skipping line " + lineNum + ": insufficient data");
                        continue;
                    }

                    for (int i = 0; i < data.length; i++)
                        data[i] = data[i].trim();

                    AcademicSchedule schedule = new AcademicSchedule();
                    schedule.setTitle(data[0]);

                    try {
                        schedule.setType(AcademicSchedule.ScheduleType.valueOf(data[1].toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        System.err.println("Line " + lineNum + ": Invalid ScheduleType " + data[1]);
                        // Default to ACADEMIC if invalid
                        schedule.setType(AcademicSchedule.ScheduleType.ACADEMIC);
                    }

                    // Flexible Date Parsing
                    schedule.setDate(parseDate(data[2]));

                    if (data.length > 3)
                        schedule.setSession(data[3]);

                    if (data.length > 4 && !data[4].isEmpty()) {
                        try {
                            String time = data[4];
                            if (time.length() == 5)
                                time += ":00";
                            else if (time.length() == 4)
                                time = "0" + time + ":00"; // H:mm
                            schedule.setStartTime(LocalTime.parse(time));
                        } catch (Exception e) {
                            System.err.println("Line " + lineNum + ": Invalid StartTime " + data[4]);
                        }
                    }

                    if (data.length > 5 && !data[5].isEmpty()) {
                        try {
                            String time = data[5];
                            if (time.length() == 5)
                                time += ":00";
                            else if (time.length() == 4)
                                time = "0" + time + ":00";
                            schedule.setEndTime(LocalTime.parse(time));
                        } catch (Exception e) {
                            System.err.println("Line " + lineNum + ": Invalid EndTime " + data[5]);
                        }
                    }

                    if (data.length > 6)
                        schedule.setSubjectName(data[6]);

                    if (data.length > 7)
                        schedule.setDescription(data[7]);

                    schedule.setDepartment(hod.getDepartment() != null ? hod.getDepartment() : "General");

                    schedules.add(schedule);
                } catch (Exception e) {
                    System.err.println("Error processing line " + lineNum + ": " + e.getMessage());
                    errors.add("Line " + lineNum + ": " + e.getMessage());
                }
            }

            if (schedules.isEmpty() && !errors.isEmpty()) {
                throw new RuntimeException("No valid schedules found. Errors: " + String.join(", ", errors));
            }

            return scheduleRepository.saveAll(schedules);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to read CSV file: " + e.getMessage());
        }
    }

    private LocalDate parseDate(String dateStr) {
        List<DateTimeFormatter> formatters = Arrays.asList(
                DateTimeFormatter.ISO_LOCAL_DATE, // yyyy-MM-dd
                DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("yyyy/MM/dd"));

        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }
        throw new IllegalArgumentException("Invalid date format: " + dateStr);
    }

    public List<AcademicSchedule> saveSchedules(List<AcademicSchedule> schedules, String hodUid) {
        User hod = userRepository.findByFirebaseUid(hodUid)
                .orElseThrow(() -> new RuntimeException("HOD not found"));

        schedules.forEach(s -> s.setDepartment(hod.getDepartment()));
        return scheduleRepository.saveAll(schedules);
    }
}
