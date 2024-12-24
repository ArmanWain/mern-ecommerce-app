# MERN E-Commerce Application

This full-stack e-commerce platform, built with the MERN (MongoDB, Express, React, Node) stack, offers a seamless and secure shopping experience. Users can easily discover products through advanced search features and enjoy a smooth checkout process powered by Stripe. Admins have access to a comprehensive dashboard for managing products, orders, users, and reviews, as well as viewing sales data.

## Link to the Deployed Project

Below is a link to the deployed project:
<br/>
[Deployed Project](https://mern-ecommerce-arman-wain.vercel.app)

You can use the following test card for payments:
<br/>
**4242 4242 4242 4242**

For the rest of the payment form, you can enter any information you like.

## Tech Stack

- MongoDB
- Express.js
- React.js
- Node.js
- Stripe
- Bootstrap
- Redux Toolkit

## Features

- **Seamless Product Discovery**: Users can easily discover products using search, pagination, and customizable filters for price, category, rating, and availability.
- **Secure Payment Processing**: Payments are securely processed through Stripe, ensuring safe transactions for users.
- **Real-Time Application Monitoring**: Real-time application monitoring and error tracking are managed through Sentry to ensure smooth performance.
- **Reliable User Authentication**: Users are securely authenticated and authorized via JWTs and user roles, ensuring data privacy and access control.
- **Comprehensive Admin Dashboard**: Admins can access sales data through interactive charts and tables and manage products, orders, users, and reviews efficiently.
- **Easy Invoice Access**: Users can view and download invoices for their orders, providing easy access to transaction details.
- **Effortless Account Recovery**: Users can quickly recover their accounts via a secure password reset email.

## Project Setup

Follow these steps to set up the project locally on your machine.

### Clone the Repository

Start by cloning the repository to your local machine:

```
git clone https://github.com/ArmanWain/mern-ecommerce-app.git
cd mern-ecommerce-app
```

### Environment Variables

Create a new file named `config.env` in the `backend/config` folder and add the following content:

```
PORT=8000
NODE_ENV=DEVELOPMENT
FRONTEND_URL=http://localhost:5173
DB_LOCAL_URI=mongodb://127.0.0.1:27017/shopico
DB_URI=
JWT_EXPIRE_TIME=7d
COOKIE_EXPIRE_TIME=7
JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_EMAIL=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SENTRY_DSN=
```

Create a new file named `.env` in the `frontend` folder and add the following content:

```
VITE_BACKEND_URL=http://localhost:8000
```

### Install Dependencies

```
npm i
cd frontend
npm i
```

### Seed Database

Run the following command to add some starter products to the database:

```
npm run seeder
```

### Run Server

```
npm run dev (run the backend in development mode)
cd frontend
npm run dev (run the frontend in development mode)
```

You can now go to http://localhost:5173/ to view the app.
