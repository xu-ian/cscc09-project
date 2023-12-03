'use client'
import { useEffect, useState } from 'react'
import socketIOClient from 'socket.io-client';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from '../../api/firebase'

function ChatBar() {
  const [user, loading, error] = useAuthState(auth);
  const [messages, setMessages] = useState(['a']);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(()=>{
    // const socket = socketIOClient("ws://"+process.env.NEXT_PUBLIC_BACKEND_SO);
    const socket = socketIOClient("wss://"+process.env.NEXT_PUBLIC_BACKEND_SO);
    socket.on("chatMessage", (data) => {
      const m = messages
      m.push(data)
      setMessages(m)
      console.log('messages', m, messages, data)
    })
    setSocket(socket);
  }, [])

  const sendMessage = (message, socket) => {
    socket.emit("chatMessage", user.displayName + ': ' + message)
    setMessage("")
  }

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
