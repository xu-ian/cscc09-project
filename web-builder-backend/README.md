[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/KRLE_tfD)
# WebSimple

## Team Members

- Ian Xu 1006319208
- Jawad Arshad 1006280917

## Description

WebSimple is a web app that anybody can use to create a website with working frontend and backend without any coding involved. 
A user can design the front-end, which supports multiple pages, components like forms, buttons, input fields, images, text, and more.
A user can connect the backend, by creating connections that link two components together and let them read and write data from the
same source. A user can also 'deploy' their web application on the app.

## Features in the Beta Version

The beta version should be a frontend website designer and backend data linking that supports these components:
- A form component
- An image component with a hardcoded or dynamic image
- Most input fields
- A dynamic or hardcoded data display field
- Buttons with functionality like changing pages, or affecting visibility of components
- Ability to link components to each other on backend 
- Ability to create multiple pages on the website designer
- Ability to navigate between multiple pages on website designer
- Ability to 'deploy' a website.

## Additional Features in the Final Version

The final version will include a login system for multiple users and the ability for users to maintain multiple websites at a time.
The final version will also include file upload and download if it cannot be done in the beta version.

## Tech Stack

For the frontend, we will use `React` with `Javascript` and `GrapesJS`.

For the backend, will use `ExpressJS` and a REST API

For the data we used `MongoDB` to store the data.

## Technical Challenges

- Figuring out how to create API calls for dynamically changing objects
- Figuring out how to handle components, so that all possible component combinations are considered without bloating test cases
- Figuring out how to handle file download for small and large files
- Figuring out how to add form components fields to grapeJs
- Learning how to use GrapesJS to create the frontend designer