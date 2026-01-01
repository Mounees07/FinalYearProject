package com.academic.platform.controller;

import com.academic.platform.model.AcademicSchedule;
import com.academic.platform.service.AcademicScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = { "http://localhost:5173", "http://10.10.188.128:5173" }, allowCredentials = "true")
public class AcademicScheduleController {

    @Autowired
    private AcademicScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<List<AcademicSchedule>> getSchedules() {
        return ResponseEntity.ok(scheduleService.getAllUpcomingSchedules());
    }

    @PostMapping("/upload")
    public ResponseEntity<List<AcademicSchedule>> uploadSchedule(
            @RequestParam("file") MultipartFile file,
            @RequestParam("hodUid") String hodUid) {
        return ResponseEntity.ok(scheduleService.processBulkUpload(file, hodUid));
    }
}
