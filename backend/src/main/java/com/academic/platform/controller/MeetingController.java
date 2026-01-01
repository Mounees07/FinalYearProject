package com.academic.platform.controller;

import com.academic.platform.model.MentorshipMeeting;
import com.academic.platform.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    @Autowired
    private MeetingService meetingService;

    @PostMapping("/schedule")
    public ResponseEntity<MentorshipMeeting> scheduleMeeting(
            @RequestParam String mentorUid,
            @RequestParam String menteeUid,
            @RequestBody MentorshipMeeting meeting) {
        return ResponseEntity.ok(meetingService.scheduleMeeting(mentorUid, menteeUid, meeting));
    }

    @PostMapping("/schedule-bulk")
    public ResponseEntity<List<MentorshipMeeting>> scheduleGroupMeeting(
            @RequestParam String mentorUid,
            @RequestBody MentorshipMeeting meeting) {
        return ResponseEntity.ok(meetingService.scheduleGroupMeeting(mentorUid, meeting));
    }

    @GetMapping("/mentor/{mentorUid}")
    public ResponseEntity<List<MentorshipMeeting>> getMentorMeetings(@PathVariable String mentorUid) {
        return ResponseEntity.ok(meetingService.getMeetingsForMentor(mentorUid));
    }

    @DeleteMapping("/{meetingId}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long meetingId) {
        meetingService.deleteMeeting(meetingId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{meetingId}")
    public ResponseEntity<MentorshipMeeting> updateMeeting(@PathVariable Long meetingId,
            @RequestBody MentorshipMeeting meeting) {
        return ResponseEntity.ok(meetingService.updateMeeting(meetingId, meeting));
    }
}
