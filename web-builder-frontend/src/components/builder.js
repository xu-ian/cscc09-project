import React from "react";
import socketIOClient from 'socket.io-client';
import { useEffect, forceUpdate, useState, useRef } from "react";
import grapesjs, { Editor } from 'grapesjs';
import GjsEditor, { Canvas } from '@grapesjs/react';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from '../firebase'

import styleManagerData from './logic/styleManagerData.mjs'
import blockManagerData from "./logic/blockManagerData.mjs";

import 'grapesjs/dist/css/grapes.min.css'
import './styles/main.css'

import PagesSidebar from './PagesSidebar'

import { setupEditor } from "./logic/editorLogic.mjs";

let x = 0;
let y = 0;

let connections = [];
let videos = [];
let idacc = 0;
const { RTCPeerConnection, RTCSessionDescription } = window;

function Builder() {
  const [user, loading, error] = useAuthState(auth);
  let streamOut = useRef(null);
  let [mousePositions, setMousePositions] = useState(null);
  let [medias, setMedias] = useState(null);
  const [gpjsEditor, setGpjsEditor] = useState(null);

  const onEditor = (editor) => {
    console.log('Editor loaded', { editor });
    console.log('user', user)
    setupEditor(editor);
    setGpjsEditor(editor)

  };

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

  const createPeerConnection = function(srcsocket, dstsocket){

    /* Return the existing connection if it already exists */
    if(getConnectionBySockId(dstsocket)){ console.log("Duplicate socket"); return getConnectionBySockId(dstsocket);}
    const peerConnection = new RTCPeerConnection();

    /* Set the connection to set value when a track is added */
    peerConnection.ontrack = function({streams: [stream]}){
      //console.log("Remote connection established", stream);
      videos.push({src: stream, dst: dstsocket});
      let medias = []
      videos.forEach(function(video){
        medias.push(<video key={video.dst} ref={
          (el) => { 
            console.log(el);
            if(el != null){
              el.srcObject = video.src;
              el.muted = true;
              el.autoplay = true;
            }
          }
        } width="300px" height="300px" className="remote-video" id={video.dst}></video>);
      });
      setMedias(medias);
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
    const socket = socketIOClient("127.0.0.1:5000");

    socket.on("mousePositions", function(data){
      updateMousePositions(socket.id, data);
    });

    /**How RTC works: 
     * - First create a new RTC Peer Connection for each other client you want to connect to, 
     * the number of available clients should be passed when the socket connects, and updated when new clients join or leave.
     * - RTC Peer Connection only connects two devices, so you should create as many RTC Peer Connections to link up all devices
     * - 
    */

    socket.on("newConnection", function(sock){
      navigator.getUserMedia({video: true, audio: false}, async function(stream){
        console.log(getConnectionBySockId(sock.sock));
        await callUser(socket, sock.sock);

        stream.getTracks().forEach(function(track){
          getConnectionBySockId(sock.sock).addTrack(track, stream);
        });
      }, err => { console.warn(err.message)});
    });

    socket.on("connectionLoss", function(sock){
      delete videos[videos.findIndex((video) => {return video.dst == sock.sock})];
      let medias = [];
      videos.forEach(function(video){
        medias.push(<video key={video.dst} ref={
          (el) => { 
            console.log(el);
            if(el != null){
              el.srcObject = video.src;
              el.muted = true;
              el.autoplay = true;
            }
          }
        } width="300px" height="300px" className="remote-video" id={video.dst}></video>);
      });
      setMedias(medias);
    });

    socket.on('Acknowledge', function(sockets){
      navigator.getUserMedia({video: true, audio: false}, function(stream) {
        
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

        /* Test for video and audio recording */
    navigator.getUserMedia({video: true, audio: true}, function(stream) {
      if(!streamOut.current) return;
      streamOut.current.srcObject = stream;
      streamOut.current.muted = true;
      streamOut.current.autoplay = true;
    }, err => { console.warn(err.message)});

    document.addEventListener("mousemove", function(event){
      x = event.pageX;
      y = event.pageY;
    });
  }, []);

  useEffect(()=>{
    console.log("Updates");
  }, [medias]);

  return (
    <div>
      <div className='row'>
        <PagesSidebar editor={gpjsEditor}/>    
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
            pageManager: {
              pages: []
            }
          },
        }}
        onEditor={onEditor}>
      </GjsEditor>
      </div>
      <div className="row" style={{minHeight:'10px'}}>
        <a className="centered" href="credits">credits</a>
        <a className="centered" href="test">test</a>
      </div>
      <div>
        <video ref={streamOut} width="300px" height="300px" className="local-video" id="local-video"></video>
        {medias}
      </div>
      {mousePositions}
    </div>
  )
}

export default Builder;