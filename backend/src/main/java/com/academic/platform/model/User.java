package com.academic.platform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String firebaseUid;

    @Column(unique = true, nullable = false)
    private String email;

    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private Role role;

    private String profilePictureUrl;

    private String rollNumber;
    private String department;
    private Integer semester;
    private String section;
    private Double gpa;
    private Double attendance;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mentor_id")
    private User mentor;

    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }

    // Manual Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirebaseUid() {
        return firebaseUid;
    }

    public void setFirebaseUid(String firebaseUid) {
        this.firebaseUid = firebaseUid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public Double getGpa() {
        return gpa;
    }

    public void setGpa(Double gpa) {
        this.gpa = gpa;
    }

    public Double getAttendance() {
        return attendance;
    }

    public void setAttendance(Double attendance) {
        this.attendance = attendance;
    }

    public User getMentor() {
        return mentor;
    }

    public void setMentor(User mentor) {
        this.mentor = mentor;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Manual Builder
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private String firebaseUid;
        private String email;
        private String fullName;
        private Role role;
        private String profilePictureUrl;
        private String rollNumber;
        private String department;
        private Integer semester;
        private String section;
        private Double gpa;
        private Double attendance;
        private User mentor;

        public UserBuilder firebaseUid(String firebaseUid) {
            this.firebaseUid = firebaseUid;
            return this;
        }

        public UserBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public UserBuilder role(Role role) {
            this.role = role;
            return this;
        }

        public UserBuilder profilePictureUrl(String profilePictureUrl) {
            this.profilePictureUrl = profilePictureUrl;
            return this;
        }

        public UserBuilder rollNumber(String rollNumber) {
            this.rollNumber = rollNumber;
            return this;

        }

        public UserBuilder department(String department) {
            this.department = department;
            return this;
        }

        public UserBuilder semester(Integer semester) {
            this.semester = semester;
            return this;
        }

        public UserBuilder section(String section) {
            this.section = section;
            return this;
        }

        public UserBuilder gpa(Double gpa) {
            this.gpa = gpa;
            return this;
        }

        public UserBuilder attendance(Double attendance) {
            this.attendance = attendance;
            return this;
        }

        public UserBuilder mentor(User mentor) {
            this.mentor = mentor;
            return this;
        }

        public User build() {
            User user = new User();
            user.setFirebaseUid(firebaseUid);
            user.setEmail(email);
            user.setFullName(fullName);
            user.setRole(role);
            user.setProfilePictureUrl(profilePictureUrl);
            user.setRollNumber(rollNumber);
            user.setDepartment(department);
            user.setSemester(semester);
            user.setSection(section);
            user.setGpa(gpa);
            user.setAttendance(attendance);
            user.setMentor(mentor);
            return user;
        }
    }
}
