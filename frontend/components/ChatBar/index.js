'use client'
import { useEffect, useState } from 'react'
import socketIOClient from 'socket.io-client';
import { useAuthState } from "react-firebase-hooks/auth";
import { query, getDocs, collection, where } from "firebase/firestore";
import { auth, db } from '../../api/firebase'

function ChatBar() {
  const [user, loading, error] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("Default Username");

  useEffect(()=>{
    const socket = socketIOClient("ws://"+process.env.NEXT_PUBLIC_BACKEND_SO);
    // const socket = socketIOClient("wss://"+process.env.NEXT_PUBLIC_BACKEND_SO);
    socket.on("chatMessage", (data) => {
      const m = messages
      m.push(data)
      setMessages(m)
      console.log('messages', m, messages, data)
    })
    setSocket(socket);
  }, [])

  const sendMessage = (message, socket) => {
    socket.emit("chatMessage", username + ': ' + message)
    setMessage("")
  }

  useEffect(() =>{
    if(user){
      user.getIdToken().then(async function(){
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const docs = await getDocs(q);
        setUsername(docs.docs[0].data().name);
      });
    }
  },[user]);

  return (
    <div className="chat-container">
      <div className="flex-col">
        <label style={{margin: '0 0 20px 0', color: 'white'}}>Chat:</label>
        {messages.map((message)=>{
          return (
          <div className="message">{message}</div>
          )
        })}
      </div>
      <div className="flex-row">
        <input
          type="text"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          />
          <input
          className="send-button"
          type="submit"
          value="Send"
          onClick={() => {sendMessage(message, socket)}}
          />
      </div>
    </div>
  );
}

export default ChatBar;
