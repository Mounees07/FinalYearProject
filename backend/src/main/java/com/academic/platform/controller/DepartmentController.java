package com.academic.platform.controller;

import com.academic.platform.dto.DepartmentDashboardDTO;
import com.academic.platform.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/department")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @GetMapping("/dashboard/{department}")
    public ResponseEntity<DepartmentDashboardDTO> getDashboardStats(@PathVariable String department) {
        return ResponseEntity.ok(departmentService.getDashboardStats(department));
    }

    @GetMapping("/analytics/{department}")
    public ResponseEntity<com.academic.platform.dto.DepartmentAnalyticsDTO> getAnalytics(
            @PathVariable String department) {
        return ResponseEntity.ok(departmentService.getAnalytics(department));
    }
}
