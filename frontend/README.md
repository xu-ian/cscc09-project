# Frontend

## public 
- Prebuilt react values

## src standalone

- App.js contains the root code for the react client app
- The other standalone files are from the base react setup

## src/components standalone
- builder.js: The code for the website builder, this code is further split into the logic folders to reduce clutter
- credits.js: The code for the credits page
- test.js: The code for the test page, to test the results of building the website

## src/components/styles
- main.css: Not used for anything currently

## src/components/logic
- api.mjs: Contains all code for backend calls
- blockManagerData.mjs: Holds the block manager data for grapesjs imported into builder.js
- styleManagerData.mjs: Holds the style manager data for grapesjs imported into builder.js
- editorLogic.mjs: Holds the logic of the grapesjs editor
- helper.mjs: Helper functions for functions in editorLogic.mjs
