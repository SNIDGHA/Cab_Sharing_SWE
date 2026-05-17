# Carpooling Web App
 This project is a carpooling web application designed to facilitate easy and efficient ride-sharing for users. Built with the MERN stack, it leverages MongoDB for database management, Express.js and Node.js for the backend, and React for the frontend. The application aims to reduce travel costs, decrease traffic congestion, and minimize environmental impact by connecting drivers with empty seats to passengers looking for a ride.  

Website Url:-https://cab-sharing-swe-3g3z.vercel.app/
Features
User Authentication: Secure signup/login functionality for drivers and passengers.
Profile Management: Users can create and edit their profiles, including vehicle details for drivers.
Ride Matching: Algorithm to match passengers with drivers based on destination, time, and preferences.
Ratings and Reviews: Users can rate and review each other to ensure safety and trustworthiness.
Responsive Design: Fully responsive web design for a seamless experience on any device.
Installation
Clone the Repository

git clone https://github.com/tanirathi/Carpooling-Web-App
cd Carpooling-Web-App
Install Dependencies

For the server:

cd backend
npm install
For the client:

cd frontend
npm install
Set up Environment Variables

Create a .env file in the backend directory and add your MongoDB URI and other config variables like:

MONGO_URI=your_mongodb_uri
PORT=5000
Run the Application

Start the backend server:

npm start
In a new terminal, start the React frontend:

cd frontend
npm start
Your app should now be running on http://localhost:3000.

Usage
After installation, users can register as a driver or passenger, complete their profiles, and start offering or booking rides. The application's intuitive interface makes it easy to navigate through available rides, communicate with other users, and manage bookings.
