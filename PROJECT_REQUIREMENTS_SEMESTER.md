# PROJECT_REQUIREMENTS.md

# AI-Powered Personalized Learning Tutor (Semester Project)

## Project Overview

A web-based AI learning platform that helps students learn through courses, quizzes, AI tutoring, and progress tracking.

The system supports three roles:

- Admin
- Teacher
- Student

Students can track their learning progress, quiz performance, and course completion through a dedicated Progress System.

---

# Authentication Flow

## First Page (Entry Page)

Users first see:

- Login
- Student Signup
- Teacher Signup

### Login
- Email
- Password
- Role Detection

### Student Signup
- Name
- Email
- Password
- Education Level

### Teacher Signup
- Name
- Email
- Password
- Subject Specialization

### Admin
- Created manually from database

---

# Tech Stack

## Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- ShadCN UI

## Backend
- Next.js API Routes

## Database
- MongoDB Atlas

## Authentication
- NextAuth
- JWT
- RBAC

## AI
- NVIDIA NIM API

## Deployment
- Vercel

---

# Dashboards

## Admin Dashboard

Features:

- View Students
- View Teachers
- Approve Teacher Accounts
- Delete Users
- Manage Courses
- Platform Analytics

---

## Teacher Dashboard

Features:

### Course Management
- Create Course
- Edit Course
- Delete Course

### Materials
- Upload Notes
- Upload PDFs
- Upload Videos

### Quiz Management
- Create Quiz
- Edit Quiz
- Delete Quiz

### Student Monitoring
- View Student Progress
- View Quiz Results

---

## Student Dashboard

Features:

### Learning
- Join Courses
- View Lessons
- Download Notes

### AI Tutor
- Ask Questions
- Get Explanations
- Learning Recommendations

### Quizzes
- Attempt Quiz
- View Results

### Progress
- Course Completion %
- Quiz Performance
- Learning Statistics
- Progress Reports

---

# AI Modules

## AI Tutor

Responsibilities:

- Answer questions
- Explain concepts
- Generate summaries
- Generate examples

## Quiz Generator

Responsibilities:

- Generate quiz questions
- Generate MCQs
- Generate True/False

## Progress Agent

Responsibilities:

- Track student progress
- Calculate course completion
- Analyze quiz scores
- Show learning trends

Outputs:

- Progress Percentage
- Weak Areas
- Strong Areas
- Learning Recommendations

---

# Database Collections

## users

- _id
- name
- email
- password
- role

## courses

- _id
- title
- description
- teacherId

## lessons

- _id
- courseId
- title
- content

## quizzes

- _id
- courseId
- title

## questions

- _id
- quizId
- question
- options
- answer

## submissions

- _id
- studentId
- quizId
- score

## progress

- _id
- studentId
- courseId
- completionPercentage

## chatHistory

- _id
- studentId
- message
- response

---

# API Endpoints

## Auth

- POST /api/auth/signup
- POST /api/auth/login

## Courses

- GET /api/courses
- POST /api/courses
- PUT /api/courses/:id
- DELETE /api/courses/:id

## Quizzes

- GET /api/quizzes
- POST /api/quizzes

## Progress

- GET /api/progress/:studentId

## AI Tutor

- POST /api/ai/chat

---

# Folder Structure

```text
src/
│
├── app/
│   ├── login/
│   ├── signup/
│   ├── admin/
│   ├── teacher/
│   └── student/
│
├── components/
├── lib/
├── models/
├── services/
├── hooks/
├── types/
└── middleware.ts
```

# Deployment

Platform:

- Vercel

Requirements:

- Environment Variables
- MongoDB Atlas Connection
- NVIDIA API Key

---

# Minimum Deliverables

- Landing/Login Page
- Student Signup
- Teacher Signup
- Admin Dashboard
- Teacher Dashboard
- Student Dashboard
- AI Tutor Chat
- Quiz System
- Progress Agent
- MongoDB Database
- Vercel Deployment
