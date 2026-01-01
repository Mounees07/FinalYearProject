package com.academic.platform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    private String leaveType; // Medical, Personal, etc.
    private LocalDate fromDate;
    private LocalDate toDate;

    private String reason;
    private String parentEmail;

    @Builder.Default
    private String parentStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    @Builder.Default
    private String mentorStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    private String parentActionToken; // Token for email link

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
