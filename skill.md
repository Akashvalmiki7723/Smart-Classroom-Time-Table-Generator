# Smart Classroom Timetable - Installation & Setup Skill

This document provides a step-by-step guide for AI assistants or human developers to successfully install, configure, and run the Smart Classroom Timetable project. 

Follow these instructions exactly in order.

## Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn or pnpm
- A running MongoDB instance (local or MongoDB Atlas)
- Git (if cloning from a repository)

---

## Step 1: Install Dependencies
Run the following command in the root directory of the project to install all required npm packages:
```bash
npm install
```

## Step 2: Configure Environment Variables
1. Check if a `.env` or `.env.local` file exists in the root directory.
2. If it does not exist, create a new file named `.env.local`.
3. Add the following environment variables (replace the MongoDB URI if using a hosted database):
```env
MONGODB_URI=mongodb://localhost:27017/smart-classroom
NEXTAUTH_SECRET=your_super_secret_key_here_make_it_long
NEXTAUTH_URL=http://localhost:3000
```
> **Note for AI:** Ensure the `MONGODB_URI` points to an active and accessible MongoDB instance before proceeding to the next steps.

## Step 3: Start the Development Server
Run the Next.js development server:
```bash
npm run dev
```
Wait for the server to successfully compile and start at `http://localhost:3000`. Leave this running in the background.

## Step 4: Reset the Database (Clean Slate)
To ensure there is no corrupted or legacy data, you must reset the database.
Make a GET request to the reset endpoint. You can do this via curl/Invoke-RestMethod or a browser.
```bash
# Using PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/seed/reset" -Method GET
```
*Wait for a success response indicating the database has been cleared.*

## Step 5: Seed the Database
Seed the database with the initial foundational data (Departments, Users, Subjects, Rooms, Batches, and Timetables).
Make a GET request to the seed endpoint. **This process can take a few minutes as it creates a large amount of data.**
```bash
# Using PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/seed" -Method GET -TimeoutSec 300
```
*Wait for a success message indicating the Presidency University seed completed successfully.*

## Step 6: Verify Installation
Verify the installation by accessing the login page at `http://localhost:3000/login`.
You should be able to log in using any of the seeded fallback accounts.

### Default Login Credentials
Use the following credentials to test different role interfaces:

| Role | Email | Password |
|------|-------|----------|
| Admin | `joseph.admin@presidencyuniversity.in` | `Joseph123` |
| HOD | `maria.hod@presidencyuniversity.in` | `Maria123` |
| Coordinator | `jennifer.coordinator@presidencyuniversity.in` | `Jennifer123` |
| Faculty | `thomas.faculty@presidencyuniversity.in` | `Thomas123` |
| Student | `alex.williams.cs@presidencyuniversity.in` | `Alex123` |

## Troubleshooting Notes for AI
- If the app returns a **401 Unauthorized** error when fetching rooms or batches, remind the user to log out and log back in, as the session might be tied to old (pre-reset) user IDs.
- If data is missing on the dashboards, verify that Step 4 and Step 5 were executed successfully.
- If the development server fails to start, check the `.env.local` configuration and ensure MongoDB is running.
