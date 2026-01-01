package com.academic.platform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    private LocalDateTime enrollmentDate;

    @Column(name = "change_count")
    @Builder.Default
    private Integer changeCount = 0;

    @Column(name = "last_updated_date")
    private LocalDateTime lastUpdatedDate;
}
