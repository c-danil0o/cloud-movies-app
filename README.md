
# Movie Storage and Management System

This project is a fully cloud-native web application designed for storing and managing movie content. The application leverages AWS services and follows a cloud-native architecture. It is developed using AWS CDK in TypeScript for the backend and Angular for the frontend.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Authors](#authors)

## Project Overview
The Movie Storage and Management System allows users to upload, search, view, and manage movies. It supports different user roles including administrators, regular users, and unauthenticated users. The system sends notifications to users and provides a personalized feed based on user interactions.

## Features
- **User Authentication**: Register and login functionality for users.
- **Movie Management**: Upload, edit, delete, and view movie content (Admin).
- **Movie Viewing**: Search and view movies (Regular users).
- **Rating System**: Rate and review movies.
- **Subscription and Notifications**: Subscribe to movie updates and receive email notifications.
- **Personalized Feed**: Get a personalized feed based on user preferences and interactions.
- **Content Transcoding**: Automatic transcoding of movies to different resolutions.

## Architecture
The system is built using various AWS services, structured as follows:

- **API Gateway**: Handles all HTTP requests and routes them to the appropriate Lambda functions.
- **Lambda Authorizers**: Authorize requests using custom logic.
- **Lambda Functions**: Implement business logic and handle CRUD operations.
- **SQS**: Used in the movie upload pipeline for handling background tasks.
- **Step Functions**: Orchestrate the movie upload and transcoding pipeline.
- **SNS**: Sends notifications to users via email.
- **DynamoDB**: Stores movie metadata, and other necessary information.
- **S3**: Stores the actual movie files.
- **Cognito**: User management and registration.

## Tech Stack
- **Frontend**: Angular
- **Backend**: AWS CDK (TypeScript), AWS Lambda, AWS API Gateway, AWS Step Functions, AWS SQS, AWS SNS, AWS DynamoDB, AWS S3

## Setup Instructions
1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/movie-storage-management.git
    cd movie-storage-management
    ```

2. **Install dependencies for the frontend**:
    ```bash
    cd frontend
    npm install
    ```

3. **Install dependencies for the backend**:
    ```bash
    cd ../backend
    npm install
    ```

4. **Deploy the backend infrastructure using AWS CDK**:
    ```bash
    cdk deploy
    ```

5. **Run the frontend application**:
    ```bash
    cd ../frontend
    ng serve
    ```

## Usage
### Register and Login
- Visit the homepage and register as a new user.
- Login with your credentials.

### Movie Management (Admin)
- Upload new movies with metadata.
- Edit or delete existing movies.
- View all uploaded movies.

### Movie Viewing (Regular Users)
- Search for movies using various filters.
- View movie details and watch movies.
- Rate and review movies.
- Subscribe to movie updates.

### Notifications
- Receive email notifications for new movies based on your subscriptions.

## Authors
- [Danilo Cvijetic](https://github.com/c-danil0o)
- [Aleksa Perovic](https://github.com/aleksaqm)
- [Vladimir Cornenki](https://github.com/cornenkiV)
