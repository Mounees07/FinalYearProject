package com.academic.platform.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔧 Running Database Schema Fixes...");
        try {
            // Fix for 'Data truncated' error on 'role' column.
            // This happens when the column was created as a MySQL ENUM missing the 'COE'
            // value.
            // Converting to VARCHAR(50) makes it flexible for any Enum value defined in
            // Java.
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(50)");
            System.out.println("✅ Successfully altered 'users' table 'role' column to VARCHAR(50)");
        } catch (Exception e) {
            System.out.println("⚠️ Database fix skipped (or failed): " + e.getMessage());
        }
    }
}
