package com.academic.platform.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = isHtml

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send HTML email: " + e.getMessage());
        }
    }

    public void sendMeetingNotification(String to, String mentorName, String title, String time, String location) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("New Mentorship Meeting Scheduled: " + title);
        message.setText("Dear Student,\n\n" +
                "A new mentorship meeting has been scheduled by " + mentorName + ".\n\n" +
                "Title: " + title + "\n" +
                "Time: " + time + "\n" +
                "Location: " + location + "\n\n" +
                "Please be on time.\n\n" +
                "Best Regards,\n" +
                "Academic Platform Team");

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public void sendBulkMeetingNotification(String[] bcc, String mentorName, String title, String time,
            String location) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setBcc(bcc); // Use BCC for privacy
        message.setSubject("Group Mentorship Meeting: " + title);
        message.setText("Dear Students,\n\n" +
                "You are invited to a group mentorship meeting by " + mentorName + ".\n\n" +
                "Title: " + title + "\n" +
                "Time: " + time + "\n" +
                "Location: " + location + "\n\n" +
                "Please make sure to attend.\n\n" +
                "Best Regards,\n" +
                "Academic Platform Team");

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send bulk email: " + e.getMessage());
        }
    }

    // --- Leave Workflow Emails ---

    public void sendParentApprovalRequest(String parentEmail, String studentName, String leaveReason, String from,
            String to, String approvalLink) {
        String html = "<html><body>"
                + "<h2>Leave Request Approval Needed</h2>"
                + "<p>Dear Parent,</p>"
                + "<p>Your child, <strong>" + studentName + "</strong>, has applied for a leave.</p>"
                + "<ul>"
                + "<li><strong>Dates:</strong> " + from + " to " + to + "</li>"
                + "<li><strong>Reason:</strong> " + leaveReason + "</li>"
                + "</ul>"
                + "<p>Please review and approve this request by clicking the button below:</p>"
                + "<a href='" + approvalLink
                + "' style='background-color:#10b981; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;'>Approve / Reject Request</a>"
                + "<p>If the button doesn't work, copy this link: " + approvalLink + "</p>"
                + "</body></html>";

        sendHtmlEmail(parentEmail, "Action Required: Leave Request for " + studentName, html);
    }

    public void sendStudentLeaveStatus(String studentEmail, String status, String comments) {
        String color = "APPROVED".equals(status) ? "#10b981" : "#ef4444";
        String html = "<html><body>"
                + "<h2>Leave Request Update</h2>"
                + "<p>Dear Student,</p>"
                + "<p>Your leave request has been <strong style='color:" + color + "'>" + status + "</strong>.</p>"
                + (comments != null ? "<p><strong>Comments:</strong> " + comments + "</p>" : "")
                + "<p>Regards,<br>Academic Team</p>"
                + "</body></html>";

        sendHtmlEmail(studentEmail, "Leave Request " + status, html);
    }
}
