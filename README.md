# __your_project_name__

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

Each page in the frontend is structured under the react next js layout. 

{For Jawad: Explain the frontend sign in using firebase}

Video and audio sharing for collaboration was implemented in the website builder part of the application using WebRTC and websockets. Whenever a user opens the website builder and would connect to the server. The server would then send it a list of all other people working on the same website and add their video and audio stream to your display.

### Backend

The backend is a REST API built using express and mongodb. Express is the middleware which processes the requests and sends responses, mongodb is the database which we chose to use to store the data being used by the clients. The login is not held in the backend, and is instead passed from frontend to backend through a firebase token.
The backend has a firebase server library which decodes and authenticates the token. The application validates requests using express-validator. 

## Deployment

**Task:** Explain how you have deployed your application. 

## Challenges

**Task:** What is the top 3 most challenging things that you have learned/developed for you app? Please restrict your answer to only three items. 

1. Using WebRTC and websockets to videoconference
2. 
3. 

## Contributions

**Task:** Describe the contribution of each team member to the project. Please provide the full name of each team member (but no student number). 

### Ian Xu

- Made the video collaboration and mouse tracking features on website building page using websockets and WebRTC. 
- Created some components for the website building page.
- Created the main menu for users. 
- Created the page to test website designs.
- Created the some test cases for the server side endpoints.

### Jawad Arshad



# One more thing? 

**Task:** Any additional comment you want to share with the course staff? 
