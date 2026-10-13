# Healthcare Application

## Overview
This is a comprehensive healthcare web application built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)**. The app is designed to provide an end-to-end solution for doctor-patient interactions, appointment booking, OTP-based login, and an admin panel for managing the system.

---

## Features

### **User Authentication**
- **Login & Registration**:
  - Users can register and log in securely.
  - Authenticated using **JWT tokens**.
- **OTP Verification**:
  - Secure OTP-based login and email verification using **Nodemailer**.

### **Doctor Search and Selection**
- Search for doctors by:
  - **Specialty** (e.g., Cardiologist, Dentist).
  - **Location** (city or hospital).
- Doctors are listed with:
  - Name
  - Specialty
  - Rating
  - Hospital affiliation

### **Appointment Booking**
- **Doctor Selection**:
  - View available doctors and their details.
  - Select a doctor and proceed to book an appointment.
- **Appointment Details**:
  - Book appointments with details like date, time, and doctor-specific notes.
  - View an appointment preview before confirming.

### **Admin Panel**
- Manage doctors, appointments, and users.
- Track user activity and generate reports.

### **Responsive Design**
- Fully responsive across desktop, tablet, and mobile devices.

### **Navigation**
- Secure navigation using **Protected Routes**:
  - Prevent logged-in users from accessing login/register pages.
  - Redirect unauthenticated users to the login page when trying to access protected routes.
- Conditional rendering for sidebars and menus.

---

## Tech Stack

### **Frontend**
- **React.js**:
  - Component-based architecture.
  - State management using React hooks (`useState`, `useEffect`, etc.).
  - Routing using `react-router-dom`.
- **Material-UI**:
  - Prebuilt components for responsive design.
- **CSS**:
  - Custom styles for components.

### **Backend**
- **Node.js**:
  - Server-side JavaScript runtime.
- **Express.js**:
  - RESTful API framework.
- **nodemailer**:
  - OTP-based verification.
- **JWT (JSON Web Tokens)**:
  - Authentication and session management.

### **Database**
- **MongoDB**:
  - NoSQL database for storing user, doctor, and appointment data.

### **Deployment**
- Hosted on **AWS** or **Heroku** for production.

---

## Installation

### Prerequisites
1. **Node.js** installed on your system.
2. **MongoDB** server running locally or a cloud instance (e.g., MongoDB Atlas).
3. Nodemailer credentials for OTP services.

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Jaimeenvaria/Carevia.git
   cd healthcare
   ```

2. Install dependencies:
   ```bash
   cd backend
   npm install
   cd frontend
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory with the following variables:
     ```env
     PORT=5000
MONGODB_URI= "Your Mongodb URI"
JWT_SECRET=your_jwt_secret
EMAIL_USER="Your Email Id"
EMAIL_PASS=Your password

HOST = smtp.gmail.com
SERVICE = gmail
EMAIL_PORT = 587
SECURE = false

ACCESS_TOKEN_SECRET=adminaccesslogin
REFRESH_TOKEN_SECRET=adminrefreshlogin

USER = "Your Email Id"
PASS = "Your app password" 

For creating PASS. Go to google manage your google accounts go to security, turn on that 2-step verification. Then search for app passwords give google your password. Type your app name and click on create. You will get 16 random characters. Use them for PASS without removing the spaces.
     
     ```

4. Run the development server:
   - Start the backend:
     ```bash
     npm run server
     ```
   - Start the frontend:
     ```bash
     cd client
     npm start
     ```

5. Access the app in your browser:
   ```
   http://localhost:3000
   ```

---

## Folder Structure
```
healthcare-app/
|-- client/               # React frontend
|   |-- public/
|   |-- src/
|       |-- components/   # Reusable components
|       |-- pages/        # Page components (e.g., Login, Register)
|       |-- styles/       # CSS files
|       |-- App.js        # Main React component
|-- server/               # Node.js backend
|   |-- models/           # MongoDB schemas
|   |-- routes/           # Express routes
|   |-- controllers/      # Route handlers
|   |-- server.js         # Entry point for backend
|-- .env                  # Environment variables
|-- package.json          # Backend dependencies
|-- README.md             # Project documentation
```

---

## API Endpoints

### **Authentication**
| Method | Endpoint             | Description               |
|--------|----------------------|---------------------------|
| POST   | /api/auth/register   | Register a new user       |
| POST   | /api/auth/login      | Login and get a token     |
| POST   | /api/auth/verify-otp | Verify OTP for login      |

### **Doctor Management**
| Method | Endpoint                 | Description                      |
|--------|--------------------------|----------------------------------|
| GET    | /api/doctors             | Get all doctors                 |
| GET    | /api/doctors/:id         | Get a single doctor by ID       |
| POST   | /api/doctors             | Add a new doctor                |
| PUT    | /api/doctors/:id         | Update a doctor's details       |
| DELETE | /api/doctors/:id         | Delete a doctor                 |

### **Appointments**
| Method | Endpoint                            | Description                      |
|--------|-------------------------------------|----------------------------------|
| POST   | /api/appointments                   | Book an appointment             |
| GET    | /api/appointments/user/:userId      | Get appointments for a user     |
| GET    | /api/appointments/doctor/:doctorId  | Get appointments for a doctor   |
| DELETE | /api/appointments/:id               | Cancel an appointment           |

---

## Screenshots
### Login Page
![Login Page](screenshots/login.png)

### Doctor Selection
![Doctor Selection](screenshots/doctor-selection.png)

### Appointment Preview
![Appointment Preview](screenshots/appointment-preview.png)

---

## Contributing
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.

---
