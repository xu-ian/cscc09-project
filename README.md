# WebBuilder

## Project URL

https://front.jawadarshad.me

## Project Video URL 

https://youtu.be/fM6CdInBsxs

## Project Description

The application we built is a online website builder, similar to Wixs and other online web builders, with the addition of that it allows users to work together collaboratively on website designs. It allows users to share their video and audio so that they can communicate as they work. It also as a chat window where they can send messages to each other. The web builder allows for multi pages to be created and worked on simultaneously.

## Development

We split the app into two separate folders frontend and backend. The fontend was built on NextJS and the backend was built on expressJS. We also used mongoDB to store the data. The application uses WebRTC and Sockets to help with communitacion. It uses WebRTC for the audio and video, while it uses sockets for the chat appliction. We also used firebase auth for allowing users to sign up and login with email and password or google auth. We also used grapesJs to make the web builder side of the application.  

### Frontend

We used React to design the frontend of the application and grapesJS as a base for the website designer.

Each page of the application in the frontend is structured under the app folder.

The sign up and login has the user fill a form that is send to firebase to get verified, what is returned is a auth token, and in the case of google auth some addional info is provided, this info is then stored in a firebase store, so we can recover it later.

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

The app is deployed on a VM on google cloud. The domain was gotten from namespace. We set up our own DNS server with google could DNS that mapped our domain to our VM, and pointed the namespace nameservers to the googledomains server. The app was containerized in to a frontend and a back end image with docker and it is puched to the VM, in the VM we docker compose up, which created a nginx reverse proxy and has our frontend point to front.jawadarshad.me, and our backend at back.jawadarshad.me

## Challenges

1. Using WebRTC and websockets to videoconference
2. Deploying an HTTPS frontend and server so that connections are not refused
3. Seting up the permissions for firebase and google auth

## Contributions

### Ian Xu

- Made the video collaboration and mouse tracking features on website building page using websockets and WebRTC. 
- Created some components for the website building page.
- Created the main menu for users. 
- Created the page to test website designs.
- Created the some test cases for the server side endpoints.

### Jawad Arshad

- Made sign in and sign up pages and connected them to firebase
- Allowed users to create pages on the web builder
- Allowed users to chat in the chat window
- Set up the deployment for the application

# One more thing? 

It's a bit buggy around the edges with how the builder interacts with the multiple user, this is because we are using a 3rd party web builder.
