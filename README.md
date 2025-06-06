# Poll Microservice

A RESTful microservice for managing polls built with Node.js, Express, and MongoDB.

## Features

- **CRUD Operations**: Create, read, update, and delete polls
- **Search & Pagination**: Search polls by question with pagination support
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Robust error handling with meaningful messages
- **Native MongoDB**: Uses MongoDB's native Node.js driver

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account, can be changed in the .env)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/PremPatel8/Polls.git
cd Polls
```

2. Install dependencies:
```bash
npm install
```

3. Create environment (.env) file for MongDB:
```bash
# Server Configuration
PORT=3000

# MongoDB Configuration
# MONGODB_URI=mongodb://localhost:27017
DB_NAME=pollsdb

# MongoDB Atlas example (you can switch between local MongoDB server and Atlas by commenting and uncommenting the right MONGODB_URI)
MONGODB_URI=mongodb+srv://username:password@polls.zh7d4x0.mongodb.net/pollsdb?retryWrites=true&w=majority&appName=Polls
```

4. Configure your environment variables in `.env`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017
DB_NAME=pollsdb
```

5. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

## API Endpoints

### Postman Collection

> [Postman collection to test the endpoints](https://www.postman.com/warped-trinity-724547/workspace/polls/collection/11322161-f1f07f14-a534-4e59-af04-3deeeb41e8f9?action=share&creator=11322161)

### GET /polls
Retrieve all polls with optional pagination and search.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in poll questions
- `sortBy` (string): Sort field (default: 'created_at')
- `sortOrder` (string): 'asc' or 'desc' (default: 'desc')

**Example:**
```
GET /polls?page=1&limit=5&search=color&sortBy=created_at&sortOrder=desc
```

### GET /polls/:id
Retrieve a single poll by ID.

**Example:**
```
GET /polls/65ecb4a9031983d68f635610
```

### POST /polls
Create a new poll.

**Request Body:**
```json
{
  "question": "What is your favorite color?",
  "options": ["Red", "Blue", "Green", "Yellow"]
}
```

### PUT /polls/:id
Update an existing poll.

**Request Body:**
```json
{
  "question": "What is your favorite programming language?",
  "options": ["JavaScript", "Python", "Java", "Go"]
}
```

### DELETE /polls/:id
Delete a poll by ID.

**Example:**
```
DELETE /polls/65ecb4a9031983d68f635610
```

## Data Validation

### Poll Creation/Update Rules:
- **Question**: Required, string, 1-500 characters
- **Options**: Required array, 2-10 items, each 1-100 characters, no duplicates

## Response Format

### Success Response:
```json
{
  "message": "Poll created successfully",
  "data": {
    "_id": "65ecb4a9031983d68f635610",
    "created_at": 1733687442,
    "updated_at": 1733687442,
    "question": "What is your favorite color?",
    "options": ["Red", "Blue", "Green", "Yellow"]
  }
}
```

### Error Response:
```json
{
  "error": "Validation error",
  "message": "Invalid poll data",
  "details": ["Question is required", "At least 2 options are required"]
}
```

### Paginated Response:
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  },
  "meta": {
    "search": "color",
    "sortBy": "created_at",
    "sortOrder": "desc"
  }
}
```

## Health Check

Check service status:
```
GET /health
```