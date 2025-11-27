# Skribblei

Welcome to **Skribblei**, a fun and engaging online multiplayer drawing and guessing game. This project provides an entertaining platform where players can showcase their drawing skills and guess the drawings of others.

## Live Demo

🎮 **[Play Skribblei Now](https://skribblei.onrender.com)**

> 💡 Open the link in **two separate tabs** to experience multiplayer mode (you'll be joined together).

## Features

- Multiplayer drawing and guessing game
- Real-time gameplay with smooth and responsive interactions
- Room-based gameplay with unique room codes
- Customizable game rooms with different word packs
- Support for multiple languages including English and Hindi
- Dark mode and light mode themes
- In-game chat functionality
- User-friendly and intuitive interface
- Real-time scoring system

## Installation

To get a local copy up and running, follow these steps:

1. **Clone the repository:**

    ```sh
    git clone <your-repository-url>
    cd skribble-clone
    ```

2. **Install dependencies:**

    ```sh
    npm install
    ```

    This will install dependencies for root, frontend, and backend.

3. **Start the development server:**

    ```sh
    npm start
    ```

    This will start the backend server. The frontend should be run separately for development:

    ```sh
    cd frontend
    npm start
    ```

4. **Open your browser and navigate to:**

    ```
    http://localhost:3000
    ```

## Usage

1. **Create or join a game room:**
    - Enter your name and select your preferred language.
    - To start a new game, click on "Create Room" and share the room code with friends.
    - To join an existing game, enter the room code provided by the host.

2. **Gameplay:**
    - One player will be chosen to draw a word from the selected word pack.
    - Other players will guess the word based on the drawing.
    - Points are awarded for correct guesses.
    - The game continues with turns rotating among players.

3. **Features:**
    - Use the dark mode toggle for a comfortable playing experience.
    - Copy the room code to easily share with friends.
    - Use the in-game chat to communicate with other players during the game.
    - Select from multiple languages for word packs (English, Hindi, and more).

## Deployment

This application can be deployed on [Render](https://render.com) or similar platforms.

### Build Command

```sh
npm run build
```

This will:
- Install all dependencies (root, frontend, and backend)
- Build the React frontend for production

### Start Command

```sh
npm start
```

This runs `node backend/server.js` which serves both the API and the built frontend in production mode.

### Environment Variables

Backend:
- PORT: defaults to 3001 locally
- CLIENT_ORIGIN: origin allowed for CORS (http://localhost:3000 in development)

Frontend:
- REACT_APP_API_URL: backend URL used by the Socket.IO client (http://localhost:3001 in development)

Render will automatically set PORT. Set CLIENT_ORIGIN and REACT_APP_API_URL to your deployed URLs in production.

### Important Notes for Deployment

1. Make sure `NODE_ENV` is set to `production` in your Render environment.
2. The server automatically serves the built frontend from `frontend/build` when in production mode.
3. Set `REACT_APP_API_URL` in `frontend/.env` to your backend URL after deployment.
4. The `homepage` field in `frontend/package.json` should be updated to your deployment URL (currently left empty with a TODO comment).

## Contributing

We welcome contributions from the community! To contribute, please follow these steps:

1. **Fork the repository.**

2. **Create a new branch:**

    ```sh
    git checkout -b feature/your-feature-name
    ```

3. **Make your changes and commit them:**

    ```sh
    git commit -m 'Add some feature'
    ```

4. **Push to the branch:**

    ```sh
    git push origin feature/your-feature-name
    ```

5. **Create a pull request.**

Please ensure your code adheres to our coding standards and includes relevant tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or suggestions, feel free to reach out:
- **Rajvardhan singh** - Project maintainer

---

Thank you for visiting **Skribblei**! We hope you enjoy playing and contributing to the project.
