import React from "react";
import socketIOClient from 'socket.io-client';
import { useEffect, useState, useRef } from "react";
import grapesjs, { Editor } from 'grapesjs';
import GjsEditor, { Canvas } from '@grapesjs/react';

import styleManagerData from './logic/styleManagerData.mjs'
import blockManagerData from "./logic/blockManagerData.mjs";

import 'grapesjs/dist/css/grapes.min.css'
import './styles/main.css'

import { setupEditor } from "./logic/editorLogic.mjs";

let x = 0;
let y = 0;

function Builder() {
  
  let streamOut = useRef(null);
  let [mousePositions, setMousePositions] = useState(null);

  const onEditor = (editor) => {
    console.log('Editor loaded', { editor });
    setupEditor(editor);
  };

  const updateMousePositions = (id, positions) => {
    let mousePositions = [];
    for(const [key , entry] of Object.entries(positions)){
      if(key != id){
        mousePositions.push(<div key={key} class="mousecursor" style={{left: entry.x, top: entry.y}}>
          <div class="mousecursorid">{key}</div></div>)
      }
    }
    setMousePositions(mousePositions);
  };

  /* useEffect with [] only activates once */
  useEffect(() =>{
    console.log("triggers");
    navigator.getUserMedia({video: true, audio: true}, function(stream) {
      console.log(streamOut);
      if(!streamOut.current) return;
      streamOut.current.srcObject = stream;
      streamOut.current.muted = true;
      streamOut.current.autoplay = true;
    }, err => { console.warn(err.message)});
    const socket = socketIOClient("127.0.0.1:5000");
    socket.on('Acknowledge', function(){
      //Sends mouse position to backend every second
      setInterval(function(){socket.emit("mousePosition", {x:x, y:y})}, 100);
    });
    socket.on("mousePositions", function(data){
      updateMousePositions(socket.id, data);
    });
    document.addEventListener("mousemove", function(event){
      x = event.pageX;
      y = event.pageY;
    });
  }, []);
  

  return (
    <div>    
      <GjsEditor
        grapesjs={grapesjs}
        grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
        options={{
          height:'490pt',
          container : '#gjs',
          fromElement: true,
          showOffsets: true,
          canvas: {
            styles: ['http://localhost:5000/stylesheet/main'],    
          },
          //StorageManager: false,
          selectorManager: { componentFirst: true },
          styleManager: {
            sectors: styleManagerData
          },
          blockManager: { /* These are blocks in the editor and the general format they are created in */
            blocks: blockManagerData,
          },
        }}
        onEditor={onEditor}
      >

      </GjsEditor>
      <div class="row" style={{'min-height':'10px'}}>
        <a class="centered" href="credits">credits</a>
        <a class="centered" href="test">test</a>
        <video ref={streamOut} width="300px" height="300px" class="local-video" id="local-video"></video>
      </div>
      {mousePositions}
    </div>
  )
}

export default Builder;