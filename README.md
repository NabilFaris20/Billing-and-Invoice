# Billing and Invoice System

A full-stack web application for managing invoices. Users can register, log in, view their profiles, and securely manage their own invoices. Built with React, Node.js, MongoDB, and deployed on AWS EC2.

---

# Live Deployment

This application is deployed on an **AWS EC2 instance**:

# Frontend:  
  Accessible via EC2 Public IP on port `3000`  
  
# Backend:  
  Hosted on the same EC2 instance, running on port `5001`  
  
All API requests from the frontend are configured to use this backend through `axiosConfig.jsx`.

# Cloning the Repository

Although the project is already deployed, the codebase can still be cloned for collaboration or future development.

```bash
git clone https://github.com/NabilFaris20/Billing-and-Invoice.git
cd billing-invoice-system

---

# What the Workflow Does

On every push or pull request to the `main` branch:
1. Checks out the repository
2. Sets up Node.js environment
3. Installs project dependencies
4. Lints and runs tests (if configured)
5. Builds the React frontend using `react-scripts build`

The pipeline ensures that the code is always clean and production-ready.

---

## 🔐 Authentication & Authorization

The app uses **JWT-based authentication** to manage user sessions securely.

- 🔒 Users register/login with email and password.
- 🪪 A JWT token is returned and stored in context/localStorage.
- 🔐 Protected API routes require this token to access.
- 🔁 Frontend guards routes using React Router and redirects unauthenticated users.

