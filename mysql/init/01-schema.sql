CREATE DATABASE IF NOT EXISTS `6703711_studyflow`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `6703711_studyflow`;

CREATE TABLE assignments (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    course VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed')
        NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

INSERT INTO assignments
    (title, course, due_date, priority, status, notes)
VALUES
    (
        'Build and Deploy SaaS Application',
        'DIT312',
        DATE_ADD(CURDATE(), INTERVAL 3 DAY),
        'high',
        'in_progress',
        'Build a Next.js app with MySQL and Docker Compose.'
    ),
    (
        'Prepare Project Presentation',
        'DIT315',
        DATE_ADD(CURDATE(), INTERVAL 5 DAY),
        'medium',
        'pending',
        'Prepare slides and demonstrate the main features.'
    ),
    (
        'Database Practice',
        'Database Systems',
        DATE_ADD(CURDATE(), INTERVAL 2 DAY),
        'high',
        'pending',
        'Practice SQL queries and table relationships.'
    ),
    (
        'Review Networking Notes',
        'Computer Networks',
        DATE_ADD(CURDATE(), INTERVAL 7 DAY),
        'low',
        'pending',
        'Review TCP/IP and network security concepts.'
    ),
    (
        'Submit Weekly Report',
        'Senior Project',
        CURDATE(),
        'medium',
        'completed',
        'Weekly progress report submitted.'
    );