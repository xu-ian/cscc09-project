'use client'
import React from "react";
import socketIOClient from 'socket.io-client';
import { useEffect, useState, useRef } from "react";
import grapesjs from 'grapesjs';
import GjsEditor from '@grapesjs/react';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from '../../api/firebase'

import styleManagerData from '../../api/logic/styleManagerData.mjs'
import blockManagerData from "../../api/logic/blockManagerData.mjs";

import 'grapesjs/dist/css/grapes.min.css'
import '../../components/styles/main.css'

import PagesSidebar from '../../components/PagesSidebar'
import ChatBar from '../../components/ChatBar'

import { setupEditor } from "../../api/logic/editorLogic.mjs";

let x = 0;
let y = 0;

let connections = [];
let videos = [];


function Builder() {
  const [user, loading, error] = useAuthState(auth);
  let streamOut = useRef(null);
  let [mousePositions, setMousePositions] = useState(null);
  let [medias, setMedias] = useState(null);
  const [gpjsEditor, setGpjsEditor] = useState(null);
  const [socket, setSocket] = useState(null);
  const onEditor = (editor) => {
    console.log('Editor loaded', { editor });
    // console.log('user', user)
    setupEditor(editor);
    setGpjsEditor(editor)
    
  };

  let RTCPeerConnection;
  let RTCSessionDescription;

  if(typeof window !== 'undefined')
  {
    RTCPeerConnection = window.RTCPeerConnection;
    RTCSessionDescription = window.RTCSessionDescription;
  }
  
  const readCookie = (name) => {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }

  /** Returns the connection associated with the socket */
  const getConnectionBySockId = (sockid) => {
    const connection = connections.find(function(connection){
      return connection[sockid] != null;
    });
    if(connection) return connection[sockid].connection;

    return connection;
  };

  const getConnectedBySockId = (sockid) => {
    const connection = connections.find(function(connection){
      return connection[sockid] != null;
    });
    return connection.connected;
  }

  const setConnectedBySockId = (sockid, status) => {
    const connection = connections.find(function(connection){
      return connection[sockid] != null;
    });
    connection.connected = status;
  }
  
  /** Sets the mouse position for all remote users */
  const updateMousePositions = (id, positions) => {
    let mousePositions = [];
    for(const [key , entry] of Object.entries(positions)){
      if(key != id){
        mousePositions.push(<div key={key} className="mousecursor" style={{left: entry.x, top: entry.y}}>
          <div className="mousecursorid">{key}</div></div>)
      }
    }
    setMousePositions(mousePositions);
  };

  const toggleAudio = function(e, video){
    video.muted = !video.muted;
    if(e.target.classList.contains("spk_off")){
      e.target.classList.replace("spk_off", "spk_on")
    } else {
      e.target.classList.replace("spk_on", "spk_off")
    }
    displayMedia();
  };

  const toggleCamera = function(e, socket){
    if(e.target.classList.contains("cam_off")){
      e.target.classList.replace("cam_off", "cam_on")
    } else {
      e.target.classList.replace("cam_on", "cam_off")
    }
    const cam_on = document.getElementById("your_camera").classList.contains("cam_on");
    const mic_on = document.getElementById("your_microphone").classList.contains("mic_on");
    socket.emit("MediaChange", {to:socket.id, video:cam_on, audio:mic_on});
  }

  const toggleMicrophone = function(e, socket){
    if(e.target.classList.contains("mic_off")){
      e.target.classList.replace("mic_off", "mic_on")
    } else {
      e.target.classList.replace("mic_on", "mic_off")
    }
    const cam_on = document.getElementById("your_camera").classList.contains("cam_on");
    const mic_on = document.getElementById("your_microphone").classList.contains("mic_on");
    socket.emit("MediaChange", {to:socket.id, video:cam_on, audio:mic_on});
  }

  const alterMedia = function(video, data){
    video.video = data.video;
    video.audio = data.audio;
    displayMedia();
  }

  const displayMedia = function(){
    let medias = []
    videos.forEach(function(video){
      const contents = []
      if(video.video){
        contents.push(<video key={video.dst} ref={(el) => {
            if(el != null){el.srcObject = video.src; el.muted = !video.audio || video.muted; el.autoplay = true;}
          }} width="100%" className="remote-video" 
          id={video.dst}></video>)
      } else {
        contents.push(<div key="video" className="video-off"></div>)
      }
      contents.push(<div key="speaker" className="spk_on image webrtc-button" onClick={(e)=>{toggleAudio(e, video)}}></div>);
      medias.push(
        <div className="videocontainer">
        {contents}
      </div>
);
    });
    setMedias(medias);
  }

  const createPeerConnection = function(srcsocket, dstsocket){

    /* Return the existing connection if it already exists */
    if(getConnectionBySockId(dstsocket)){ return getConnectionBySockId(dstsocket);}
    const peerConnection = new RTCPeerConnection();

    /* Set the connection to set value when a track is added */
    peerConnection.ontrack = function({streams: [stream]}){
      //console.log("Remote connection established", stream);
      const video = videos.find(function(video){
        if(video){
          return video.dst == dstsocket;
        }
        return false;
      });
      console.log(stream.getTracks());
      if(video){

        video.src = stream;
      } else{
        videos.push({src: stream, dst: dstsocket, video: true, audio: true, muted: false});
      }
      displayMedia();
    };
      
    /* When a peer connection generates an ICE Candidate, send it to the destination socket */
    peerConnection.onicecandidate = function(event){
      if(event.candidate){
        srcsocket.emit("SendIceCandidate", {'ice-candidate': event.candidate, to: dstsocket});
      }
    };
    
    let connection = {};
    connection[dstsocket] = {connection: peerConnection, connected: false};
    connections.push(connection);
    return peerConnection;
  }

  /** Opens a WebRTC Connection between the source socket and a destination socket */
  const callUser = async function(srcsocket, dstsocket){
    //console.log("Attempting to create a connection between", srcsocket.id, dstsocket);
    const peerConnection = createPeerConnection(srcsocket, dstsocket);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    srcsocket.emit("SendAudioLink", {offer: offer, to: dstsocket});
  };

  /* useEffect with [] only activates once */
  useEffect(() =>{
    /* Sockets */
    //const socket = socketIOClient("ws://localhost:5000");
    const socket = socketIOClient("ws://"+process.env.NEXT_PUBLIC_BACKEND_SO);
    // const socket = socketIOClient("wss://"+process.env.NEXT_PUBLIC_BACKEND_SO);
    console.log(document.cookie);
    socket.on("mousePositions", function(data){
      updateMousePositions(socket.id, data);
    });

    socket.on("newConnection", function(sock){
      navigator.getUserMedia({video: true, audio: true}, async function(stream){
        console.log(getConnectionBySockId(sock.sock));
        await callUser(socket, sock.sock);

        stream.getTracks().forEach(function(track){
          getConnectionBySockId(sock.sock).addTrack(track, stream);
        });
      }, err => { console.warn(err.message)});
    });

    socket.on("connectionLoss", function(sock){
      
      videos.splice(videos.findIndex((video) => {
        if(video){
          return video.dst == sock.sock
        }
        return false
      }), 1);
      displayMedia();
    });

    socket.on("WebsiteRequest", function(){
      socket.emit("WebsiteResponse", readCookie("site"));
    });

    socket.on('Acknowledge', function(sockets){
      console.log(sockets);
      navigator.getUserMedia({video: true, audio: true}, function(stream) {
        
        sockets.forEach(async function(dstsocket){
          await callUser(socket, dstsocket);
        
          stream.getTracks().forEach(function(track){
            getConnectionBySockId(dstsocket).addTrack(track, stream);
          });
        });
      }, err => { console.warn(err.message)});
      //Sends mouse position to backend every second
      setInterval(function(){socket.emit("mousePosition", {x:x, y:y})}, 100);
      //Sets the audio for every active connection

    });

    socket.on("ReceiveAudioLink", async data =>{
      //console.log(socket.id, " has received a link from ", data.to);
      const peerConnection = getConnectionBySockId(data.to);
      if(peerConnection){
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
        navigator.getUserMedia({video: true, audio: false}, function(stream) {
          stream.getTracks().forEach(function(track){
            peerConnection.addTrack(track, stream);
          });
        },  err => { console.warn(err.message)});
        socket.emit("SendAudioAnswer", {answer, to: data.to});
      }
    });

    socket.on("ReceiveAudioAnswer", async data =>{
      //console.log(socket.id, " has received an answer from ", data.to);
      await getConnectionBySockId(data.to).setRemoteDescription(new RTCSessionDescription(data.answer));
      if(!getConnectedBySockId(data.to)){
        await callUser(socket, data.to);
        setConnectedBySockId(data.to, true);
      }
    });

    socket.on("ReceiveIceCandidate", async function(data){
      if(data['ice-candidate']){
        await getConnectionBySockId(data.to).addIceCandidate(data['ice-candidate']);
      }
    });

    socket.on("ReceiveMediaChange", function(data){
      const video = videos.find(function(video){
        return video.dst == data.to;
      });
      console.log(video);
      if(video){
        alterMedia(video, data);
      }
    });

    setSocket(socket);

    /* Sets up this client's webcam and audio */
    navigator.getUserMedia({video: true, audio: true}, function(stream) {
      if(!streamOut.current) return;
      streamOut.current.srcObject = stream;
      streamOut.current.muted = true;
      streamOut.current.autoplay = true;
    }, err => { console.warn(err.message)});
    
    document.getElementById("root").addEventListener("mousemove", function(event){
      x = event.pageX;
      y = event.pageY;
    });
  }, []);


  return (
    <div id='root'>
      <div className='row flex'>
        <PagesSidebar editor={gpjsEditor}/>    
        <GjsEditor
          grapesjs={grapesjs}
          grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
          options={{
            height:'400pt',
            container : '#gjs',
            fromElement: true,
            showOffsets: true,
            canvas: {
              styles: [`${process.env.NEXT_PUBLIC_BACKEND}/stylesheet/main`],    
              //styles: ['http://localhost:5000/stylesheet/main'],    
            },
            //StorageManager: false,
            selectorManager: { componentFirst: true },
            styleManager: {
              sectors: styleManagerData
            },
            blockManager: { /* These are blocks in the editor and the general format they are created in */
              blocks: blockManagerData,
              pageManager: {
                pages: []
              }
            },
          }}
          onEditor={onEditor}>
        </GjsEditor>
        <ChatBar />  
      </div>
      {medias}
      <div className="videocontainer">
        <video ref={streamOut} width="100%" className="local-video" id="local-video"></video>
          <div className="username">Your Name Here</div>
          <div id="your_camera" className="cam_on image webrtc-button" onClick={(e)=>{toggleCamera(e, socket)}}></div>
          <div id="your_microphone" className="mic_on image webrtc-button" onClick={(e)=>{toggleMicrophone(e, socket)}}></div>
      </div>
      <div className="row flex" style={{minHeight:'10px'}}>
        <a className="centered" href="credits">credits</a>
        <a className="centered" href="test">test</a>
      </div>
      {mousePositions}
    </div>
  )
}

export default Builder;