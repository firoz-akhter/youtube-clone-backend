# youtube-clone-backend

Features
Frontend:
React + Vite: Lightning-fast development environment with HMR (Hot Module Replacement).
Tailwind CSS: Fully styled using Tailwind for a clean and responsive design.
Dynamic Components:
Homepage.jsx: Displays a grid of videos.
VideoPlayer.jsx: Plays individual videos with a responsive player.
Header.jsx: Navigation bar for searching and browsing.
Sidebar.jsx: Menu for quick access to categories and channels.
VideoGrid.jsx: Displays videos in a grid format.
UserProfile.jsx: User information and settings.
Form.jsx: User input forms.
Channel.jsx and ChannelView.jsx: Channel-specific content.
Error.jsx: Error page for handling routing or API issues.
App.jsx: Main application entry point with routing.

Backend:
Express.js: Backend framework for handling API and server-side logic.
Mongoose: Used to define database schemas and interact with MongoDB.
JWT Authentication: Middleware for secure user authentication.
Custom Middleware: Includes error handling and request validation.
RESTful APIs: Endpoints for user data, videos, and other resources.

Setup Instructions

1. Clone the Repository
   git clone <repository-url>
   cd youtube-clone-frontend
2. Install Dependencies
   Ensure you have Node.js installed. Then, install the necessary dependencies:
   npm install

Running the Application

1. Frontend:
   npm run dev
2. Backend:
   npm run dev

Full-Stack Integration:
Frontend and backend connected via RESTful API calls using Axios as well as fetch.

Additional Resources
A short video demonstration is included in the repository, showcasing the functionality of both the frontend and backend.

Purpose
This project demonstrates the ability to:

Build a fully functional YouTube-like application using modern web technologies.
Implement a scalable frontend with React and Tailwind CSS.
Design and implement a robust backend with Express.js and MongoDB.
Apply authentication and error-handling best practices.

Project Workflow
Frontend Development:

Built using React components structured for modularity and reusability.
Styled entirely with Tailwind CSS for a modern and consistent UI.
Backend Development:

API routes implemented with Express.js for handling data operations.
Middleware for authentication, error handling, and logging.
MongoDB for data storage, managed with Mongoose.
Full-Stack Integration:

Frontend and backend connected via RESTful API calls using Axios as well as Fetch.

demo videoUrl => https://drive.google.com/file/d/1F49315FgRtxFtK9yQoT3TZDNEOXbCSEr/view
github repo => https://github.com/firoz-akhter/youtube-clone-backend.git
