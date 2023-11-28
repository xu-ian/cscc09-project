# WebBuilder

## Project URL

**Task:** Provide the link to your deployed application. Please make sure the link works. 

## Project Video URL 

**Task:** Provide the link to your youtube video. Please make sure the link works. 

## Project Description

**Task:** Provide a detailed description of your app

## Development

**Task:** Leaving deployment aside, explain how the app is built. Please describe the overall code design and be specific about the programming languages, framework, libraries and third-party api that you have used. 

We split the app into two separate folders frontend and backend.

### Frontend

We used React to design the frontend of the application and grapesJS as a base for the website designer.

Each page in the frontend is structured under the react next js layout?{For Jawad: Correct this if I am wrong} 

{For Jawad: Explain the frontend sign in using firebase}

Video and audio sharing for collaboration was implemented in the website builder part of the application using WebRTC and websockets. All socket connections are stored in memory server side, socket ids are stored in memory client side. Clients create the initial connection through the server, but sustain connection without the server afterwards. 

### Backend

The backend is a REST API built using express and mongodb.

Express is the backend framework which processes REST API requests and sends responses, Mongodb is the database which we chose to use to store the data being used by the clients.

Database queries are done through the mongoose API. 

The login is not held in the backend, and is instead passed from frontend to backend through a firebase token.

The backend has a firebase server library which decodes and authenticates the token. The application validates requests using express-validator. 

CORS headers are manually set by the application instead of using the cors library. 

Used helmet library to for additional security.

## Deployment

**Task:** Explain how you have deployed your application. 

{For Jawad: Fill this in}

## Challenges

**Task:** What is the top 3 most challenging things that you have learned/developed for you app? Please restrict your answer to only three items. 

1. Using WebRTC and websockets to videoconference
2. Deploying an HTTPS frontend and server so that connections are not refused{For Jawad: Correct this statement if untrue}
3. {For Jawad: Fill this in}

## Contributions

**Task:** Describe the contribution of each team member to the project. Please provide the full name of each team member (but no student number). 

### Ian Xu

- Made the video collaboration and mouse tracking features on website building page using websockets and WebRTC. 
- Created some components for the website building page.
- Created the main menu for users. 
- Created the page to test website designs.
- Created the some test cases for the server side endpoints.

### Jawad Arshad

{For Jawad: Fill in what you did here}

# One more thing? 

**Task:** Any additional comment you want to share with the course staff? 
