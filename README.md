# 🎬 ClipStack

![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen) ![License](https://img.shields.io/badge/license-ISC-blue)

> ClipStack is a video ranking studio application that enables users to upload, rank, customize, and export compiled video montages with dynamic overlays.

This project provides a comprehensive solution for creating styled video rankings, primarily targeting content creators. It features a React-based frontend for interactive video management and an Express backend leveraging FFmpeg for robust video processing, including trimming, scaling, concatenation, and overlay generation.

## ✨ Features

### 🔧 Core Functionality
- ⬆️ **Video Upload & Management**: Seamlessly upload multiple video files for processing.
- 🔄 **Intuitive Ranking System**: Arrange and reorder videos to define their rank within the compilation.
- ✍️ **Custom Title Editor**: Define a main title and optionally highlight specific text with a custom color.
- 🚀 **FFmpeg-Powered Video Export**: Generate a single, compiled video with a consistent vertical aspect ratio (9:16).
- 🎨 **Dynamic Overlays**: Automatically adds a top title bar and animated rank indicators to the exported video.

### 🎥 User Experience
- 👁️ **Real-time Preview Player**: Instantly preview video order, labels, and ranking in an integrated player.
- 🏷️ **Editable Video Labels**: Customize descriptive labels for each ranked video.
- 🗑️ **Video Deletion**: Remove unwanted videos from the project.
- 📱 **Client-side Navigation**: Easily switch between videos in the preview player.

## 🛠️ Tech Stack

| Category        | Technologies                                   |
|-----------------|------------------------------------------------|
| Frontend        | [React], [Vite], CSS                           |
| Backend         | [Node.js], [Express], [FFmpeg]                 |
| Development     | [Vite], Nodemon                                |

## 🚀 Quick Start

### Prerequisites
Before running the application, ensure you have the following installed:

-   [Node.js] `>= 18.0.0`
-   npm `>= 9.0.0` (or [Yarn] `>= 1.22.0`)
-   [FFmpeg] CLI tool: This is a critical dependency for the backend's video processing capabilities. Ensure it is installed and accessible in your system's PATH.

### Installation
Clone the repository and install dependencies for both the backend and frontend components.

```bash
# Clone the repository
git clone https://github.com/your-username/clipstack.git # Replace with actual repo URL
cd clipstack

# Navigate to the backend directory and install dependencies
cd backend
npm install
# or
yarn install
cd ..

# Navigate to the frontend directory and install dependencies
cd frontend
npm install
# or
yarn install
cd ..
```

### Running the Application
The ClipStack application consists of two independent services: a backend server and a frontend development server. Both must be running concurrently.

> [!WARNING]
> The backend server (running on port `3001`) and the frontend development server must be started in separate terminal windows.

```bash
# --- In your first terminal (for the backend) ---
cd backend

# Start the backend server in development mode with nodemon (auto-restarts on file changes)
npm run dev

# For a production-like environment (without nodemon):
# npm start
cd ..

# --- In your second terminal (for the frontend) ---
cd frontend

# Start the frontend development server
npm run dev
cd ..
```
Once both servers are running, open your web browser and navigate to `http://localhost:5173` (or the port indicated by the Vite development server) to access the ClipStack application.

### Environment Configuration
The application is configured to run locally by default with the backend on `http://localhost:3001`. No `.env` file setup is required for initial local development. Ensure the [FFmpeg] CLI tool is correctly installed and available in your system's PATH, as the backend directly invokes FFmpeg commands.

## 💻 Development

### Available Scripts

#### Backend (`video-ranking-app/backend/package.json`)

| Script        | Description                                      |
|---------------|--------------------------------------------------|
| `npm start`   | Starts the backend server using Node.js          |
| `npm run dev` | Starts the backend server using Nodemon for auto-restarts |

#### Frontend (`video-ranking-app/frontend/package.json`)

| Script          | Description                                      |
|-----------------|--------------------------------------------------|
| `npm run dev`   | Starts the Vite development server               |
| `npm run build` | Creates an optimized production build for the frontend |
| `npm run preview` | Serves the production build locally for testing  |

### Project Structure
The project is structured as a monorepo containing distinct backend and frontend applications.

```
.
├── backend/                  # Node.js/Express server for API and video processing
│   ├── package.json          # Backend dependencies and scripts
│   ├── server.js             # Express application entry point, middleware, routes
│   ├── services/             # Core backend services, e.g., FFmpegRenderer
│   └── routes/               # API route definitions (upload, render)
├── frontend/                 # React application built with Vite
│   ├── package.json          # Frontend dependencies and scripts
│   ├── public/               # Static assets
│   ├── src/                  # React source code
│   │   ├── App.jsx           # Main application component
│   │   ├── components/       # Reusable UI components (e.g., VideoList, TitleEditor)
│   │   ├── hooks/            # Custom React hooks (e.g., useProject for state logic)
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles
│   └── index.html            # HTML entry point for the frontend
└── package.json (root)       # General project metadata (license)
```

## 📡 API Reference

The backend exposes a RESTful API for video upload, project rendering, and health checks. All endpoints are prefixed with `/api`.

| Method | Endpoint             | Description                                          | Authentication | Request Body (Content-Type)       |
|--------|----------------------|------------------------------------------------------|----------------|-----------------------------------|
| `POST` | `/api/upload`        | Uploads video files to the server.                   | None           | `multipart/form-data` (files)     |
| `POST` | `/api/render`        | Initiates the video rendering process for a project. | None           | `application/json` (project data) |
| `GET`  | `/api/health`        | Checks the server's health status.                   | None           | None                              |

### Static File Serving
-   `GET /uploads/:filename`: Serves uploaded video files and thumbnails.
-   `GET /exports/:filename`: Serves exported final video files.

## 🚢 Deployment

ClipStack is a split-stack application requiring separate deployments for its backend and frontend components.

### Backend Deployment
The backend is a [Node.js] application using [Express]. It requires a server environment where [Node.js] is installed and the [FFmpeg] CLI tool is available in the system's PATH.

1.  Build your Node.js application (if transpilation or bundling is required, though not explicitly in `package.json`).
2.  Deploy the `backend` directory content to a Node.js-compatible server.
3.  Ensure [FFmpeg] is installed on the deployment server.
4.  Start the backend process (e.g., `npm start` or a process manager like PM2).
5.  Configure firewalls and reverse proxies as needed for port `3001` or your chosen port.

### Frontend Deployment
The frontend is a [React] application built with [Vite]. It generates static assets that can be served by any web server or CDN.

1.  Navigate to the `frontend` directory.
2.  Run `npm run build` to create a production-optimized build. This will generate a `dist` directory.
3.  Deploy the contents of the `dist` directory to your preferred static hosting service (e.g., Nginx, Apache, Vercel, Netlify, AWS S3).
4.  Ensure the frontend application can communicate with the deployed backend API (e.g., by configuring `API_BASE` if it were an environment variable, currently hardcoded to `http://localhost:3001`).

## 📄 License

This project is licensed under the [ISC License][isc-license].

---

[react]: https://react.dev
[vite]: https://vitejs.dev
[nodejs]: https://nodejs.org
[express]: https://expressjs.com
[ffmpeg]: https://ffmpeg.org
[yarn]: https://yarnpkg.com
[isc-license]: https://opensource.org/licenses/ISC
