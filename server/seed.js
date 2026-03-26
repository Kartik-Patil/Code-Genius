/**
 * MySQL Seed Script
 * Run: node seed.js
 * 
 * Creates sample users and code history entries for testing.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, connectDB } = require('./config/db');
const User = require('./models/User');
const CodeHistory = require('./models/CodeHistory');

// Sample users data
const usersData = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'Password123!',
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'Password123!',
  },
  {
    username: 'alex_dev',
    email: 'alex@example.com',
    password: 'Password123!',
  },
  {
    username: 'sara_coder',
    email: 'sara@example.com',
    password: 'Password123!',
  },
];

// Sample code snippets for history
const codeSnippets = [
  {
    language: 'javascript',
    code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
    aiResponse: {
      errors: '• No syntax errors detected.\n• Logic issue: Recursive implementation has exponential time complexity O(2^n).',
      suggestions: '• Consider using memoization or iterative approach for better performance.\n• Add input validation to handle negative numbers.',
      explanation: 'This function calculates the nth Fibonacci number using recursion. It returns n if n is 0 or 1, otherwise it adds the two previous Fibonacci numbers.',
    },
  },
  {
    language: 'python',
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

numbers = [64, 34, 25, 12, 22, 11, 90]
print(bubble_sort(numbers))`,
    aiResponse: {
      errors: '• No syntax errors detected.\n• The algorithm works correctly.',
      suggestions: '• Add early termination if no swaps occur in a pass.\n• Consider using Python\'s built-in sorted() for production code.',
      explanation: 'Bubble sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until sorted.',
    },
  },
  {
    language: 'java',
    code: `public class HelloWorld {
    public static void main(String[] args) {
        String message = "Hello, World!";
        System.out.println(message);
        
        for (int i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
        }
    }
}`,
    aiResponse: {
      errors: '• No errors detected. Code compiles successfully.',
      suggestions: '• Consider using StringBuilder for string concatenation in loops.\n• Add comments to explain the purpose of the loop.',
      explanation: 'This Java program prints "Hello, World!" and then counts from 0 to 4. It demonstrates basic string handling and for-loop iteration.',
    },
  },
  {
    language: 'typescript',
    code: `interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}! Your email is \${user.email}\`;
}

const newUser: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

console.log(greetUser(newUser));`,
    aiResponse: {
      errors: '• No type errors or syntax issues detected.',
      suggestions: '• Consider making email optional with `email?: string`.\n• Add validation for email format.',
      explanation: 'This TypeScript code defines a User interface with id, name, and email properties. The greetUser function takes a User object and returns a formatted greeting string using template literals.',
    },
  },
];

const seedDatabase = async () => {
  try {
    // Connect to database and sync tables
    await connectDB();

    // Clear existing data
    await CodeHistory.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });
    console.log('Cleared existing data.');

    // Create users (password is hashed by beforeCreate hook)
    const createdUsers = [];

    for (const userData of usersData) {
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        passwordHash: userData.password,
      });
      createdUsers.push(user);
      console.log(`Created user: ${userData.username} (${userData.email})`);
    }

    // Create code history entries (distribute among users)
    for (let i = 0; i < codeSnippets.length; i++) {
      const snippet = codeSnippets[i];
      const user = createdUsers[i % createdUsers.length];

      await CodeHistory.create({
        userId: user.id,
        code: snippet.code,
        language: snippet.language,
        aiErrors: snippet.aiResponse.errors,
        aiSuggestions: snippet.aiResponse.suggestions,
        aiExplanation: snippet.aiResponse.explanation,
      });
      console.log(`Created code history for ${user.username} (${snippet.language})`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('─────────────────────────────');
    usersData.forEach((u) => {
      console.log(`Email: ${u.email}`);
      console.log(`Password: ${u.password}`);
      console.log('─────────────────────────────');
    });
  } catch (err) {
    console.error('Seeding error:', err.message);
    console.error(err);
  } finally {
    await sequelize.close();
    console.log('\nMySQL connection closed.');
  }
};

// Run seeder
seedDatabase();
