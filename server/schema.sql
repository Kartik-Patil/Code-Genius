-- ============================================================================
-- Code Genius - MySQL Schema (XAMPP)
-- ============================================================================
-- Run this in phpMyAdmin or MySQL CLI to create tables manually.
-- Alternatively, Sequelize auto-syncs tables on server start.
-- ============================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS code_genius;
USE code_genius;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS code_history;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- USERS TABLE
-- Stores user authentication and profile data
-- ============================================================================
CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(30) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    passwordHash    VARCHAR(255) NOT NULL,
    createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- CODE_HISTORY TABLE
-- Stores saved code snippets and AI analysis results per user
-- ============================================================================
CREATE TABLE code_history (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    userId          INT NOT NULL,
    code            TEXT NOT NULL,
    language        VARCHAR(40) NOT NULL,
    aiErrors        TEXT,
    aiSuggestions   TEXT,
    aiExplanation   TEXT,
    savedAt         DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_history_user (userId),
    INDEX idx_history_saved (savedAt),
    CONSTRAINT fk_history_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- LOGS TABLE
-- Audit log for AI API requests
-- ============================================================================
CREATE TABLE logs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    userId          INT NOT NULL,
    action          ENUM('detect-errors', 'suggest', 'explain') NOT NULL,
    language        VARCHAR(40) NOT NULL,
    code            TEXT NOT NULL,
    aiResponse      TEXT NOT NULL,
    createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_logs_user (userId),
    INDEX idx_logs_action (action),
    CONSTRAINT fk_logs_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- SAMPLE DATA (4 Users + Code History)
-- ============================================================================

-- Insert sample users (password is 'Password123!' hashed with bcrypt)
-- Note: Use `node seed.js` instead for proper password hashing
INSERT INTO users (username, email, passwordHash) VALUES
    ('john_doe', 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4a.ABCDEFGHIJK'),
    ('jane_smith', 'jane@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4a.ABCDEFGHIJK'),
    ('alex_dev', 'alex@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4a.ABCDEFGHIJK'),
    ('sara_coder', 'sara@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4a.ABCDEFGHIJK');

-- Insert sample code history
INSERT INTO code_history (userId, code, language, aiErrors, aiSuggestions, aiExplanation) VALUES
(
    1,
    'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log(fibonacci(10));',
    'javascript',
    '• No syntax errors detected.\n• Logic issue: Recursive implementation has exponential time complexity O(2^n).',
    '• Consider using memoization or iterative approach for better performance.\n• Add input validation to handle negative numbers.',
    'This function calculates the nth Fibonacci number using recursion. It returns n if n is 0 or 1, otherwise it adds the two previous Fibonacci numbers.'
),
(
    2,
    'def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr\n\nnumbers = [64, 34, 25, 12, 22, 11, 90]\nprint(bubble_sort(numbers))',
    'python',
    '• No syntax errors detected.\n• The algorithm works correctly.',
    '• Add early termination if no swaps occur in a pass.\n• Consider using Python''s built-in sorted() for production code.',
    'Bubble sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.'
),
(
    3,
    'public class HelloWorld {\n    public static void main(String[] args) {\n        String message = \"Hello, World!\";\n        System.out.println(message);\n        for (int i = 0; i < 5; i++) {\n            System.out.println(\"Count: \" + i);\n        }\n    }\n}',
    'java',
    '• No errors detected. Code compiles successfully.',
    '• Consider using StringBuilder for string concatenation in loops.\n• Add comments to explain the purpose of the loop.',
    'This Java program prints \"Hello, World!\" and then counts from 0 to 4.'
),
(
    4,
    'interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nfunction greetUser(user: User): string {\n  return `Hello, ${user.name}!`;\n}\n\nconst newUser: User = { id: 1, name: \"Alice\", email: \"alice@example.com\" };\nconsole.log(greetUser(newUser));',
    'typescript',
    '• No type errors or syntax issues detected.',
    '• Consider making email optional with `email?: string`.\n• Add validation for email format.',
    'This TypeScript code defines a User interface and a greetUser function using template literals.'
);

-- ============================================================================
-- USEFUL QUERIES
-- ============================================================================

-- Get user''s code history with pagination (page 1, 20 items)
-- SELECT * FROM code_history WHERE userId = 1 ORDER BY savedAt DESC LIMIT 20 OFFSET 0;

-- Get user by email for login (include passwordHash)
-- SELECT id, username, email, passwordHash FROM users WHERE email = 'john@example.com';

-- Count user''s history items
-- SELECT COUNT(*) FROM code_history WHERE userId = 1;

-- Delete old logs (older than 30 days)
-- DELETE FROM logs WHERE createdAt < DATE_SUB(NOW(), INTERVAL 30 DAY);
