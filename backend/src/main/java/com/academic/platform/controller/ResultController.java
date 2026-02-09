package com.academic.platform.controller;

import com.academic.platform.model.Result;
import com.academic.platform.service.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    @Autowired
    private ResultService resultService;

    @Autowired
    private com.academic.platform.service.SystemSettingService systemSettingService;

    @PostMapping("/publish-bulk")
    public ResponseEntity<List<String>> publishBulk(@RequestParam("file") MultipartFile file) {
        if ("false".equalsIgnoreCase(systemSettingService.getSetting("feature.result.enabled"))) {
            return ResponseEntity.status(403).body(List.of("Result module disabled."));
        }
        try {
            return ResponseEntity.ok(resultService.processBulkResultUpload(file.getInputStream()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(List.of("Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate(
            @RequestParam(required = false) String dept,
            @RequestParam(required = false) Integer sem) {

        byte[] csv = resultService.generateTemplate(dept, sem);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=result_entry_template.csv")
                .header("Content-Type", "text/csv")
                .body(csv);
    }

    @GetMapping("/student/{uid}")
    public ResponseEntity<List<Result>> getStudentResults(@PathVariable String uid) {
        return ResponseEntity.ok(resultService.getResultsByStudent(uid));
    }

    @GetMapping("/recent-publications")
    public ResponseEntity<List<Result>> getRecentPublications() {
        return ResponseEntity.ok(resultService.getRecentPublishedResults());
    }
}
