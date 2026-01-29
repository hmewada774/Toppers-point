
Toppers Point Web Application
===========================

About
-----
This is the official web application for Toppers Point. The application provides a platform for showcasing course details, faculty information, student achievements (toppers), and upcoming events. It includes a public-facing website and an admin panel for managing dynamic content.

Live Demo
---------
https://toppers-point.onrender.com/

Features
--------
- Public Website:
  - Home Page with dynamic pamphlets/sliders.
  - Courses & Faculty information.
  - Student Toppers showcase.
  - Events gallery.
  - Contact form.
- Admin Panel (Protected):
  - Manage Toppers (Add/Edit/Delete).
  - Manage Events.
  - Update Home Page content.
  - Secure Login/Logout.

Technology Stack
----------------
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose)
- Frontend: HTML5, CSS3, JavaScript (Vanilla)
- Authentication: Express Sessions
- Security: Helmet, CORS
- Deployment: Render

Installation & Setup
--------------------
1. Clone the repository.
   git clone <repository_url>

2. Install dependencies.
   npm install

3. Configure Environment Variables.
   Create a .env file in the root directory and add the following:
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your_secret_key
   PORT=5666

4. Run the application.
   npm start
   # Or for development with auto-restart:
   npm run dev

5. Open in browser.
   http://localhost:5666

Usage
-----
- The public website serves as the landing page for visitors.
- Visit /admin-login.html to access the admin interfaces.
