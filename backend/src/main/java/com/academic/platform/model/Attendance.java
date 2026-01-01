package com.academic.platform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "student_attendance", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "student_id", "date" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private LocalDate date;

    private LocalTime checkInTime;

    private String status; // PRESENT, LATE

    @PrePersist
    protected void onCreate() {
        if (date == null)
            date = LocalDate.now();
        if (checkInTime == null)
            checkInTime = LocalTime.now();
        if (status == null)
            status = "PRESENT";
    }
}
