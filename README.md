# AcaSync: Smart Unified Academic Management and Analytics Platform

AcaSync is a comprehensive platform designed for modern educational institutions to manage academic activities, track performance, and streamline communication between students, faculty, and administrators.

## Features
- **Centralized Management**: Role-based dashboards for Students, Faculty, and Admins.
- **Analytics Hub**: Visual representation of academic progress and performance.
- **Assignment Tracking**: Digital submission and evaluation system.
- **Attendance System**: Real-time tracking with analytics.
- **Security**: Google Firebase Authentication integration with RBAC.

## Tech Stack
- **Frontend**: React, Vite, Recharts, Framer Motion, Lucide Icons.
- **Backend**: Spring Boot 3.2, Spring Security, Spring Data JPA.
- **Database**: MySQL.
- **Auth**: Firebase Administration SDK.

## Setup Instructions

### Backend (Spring Boot)
1. Ensure You have Java 17+ and Maven installed.
2. Update `backend/src/main/resources/application.properties` with your MySQL credentials.
3. Place your Firebase Service Account JSON file at `backend/src/main/resources/firebase-service-account.json`. (Get this from Firebase Console -> Project Settings -> Service Accounts).
4. Run: `mvn spring-boot:run` from the `backend` folder.

### Frontend (React)
1. Navigate to the `frontend` folder: `cd frontend`.
2. Install dependencies: `npm install`.
3. Update `frontend/src/firebase/config.js` with your Firebase project credentials.
4. Run: `npm run dev`.

### Database
1. Run the `db-setup.sql` script in your local MySQL instance.
2. Hibernate will automatically create the tables on first backend startup.

## Project Structure
- `/frontend`: React application.
- `/backend`: Spring Boot REST API.
- `/db-setup.sql`: Database initialization script.
