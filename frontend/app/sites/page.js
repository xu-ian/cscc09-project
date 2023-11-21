'use client'
import { query, getDocs, collection, where, addDoc } from "firebase/firestore";
import { useEffect, forceUpdate, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { sendToken } from "../../src/components/logic/api.mjs";
import { auth} from '../../src/firebase'

import "./style.css"

export default function Websites(){

  const [user, loading, error] = useAuthState(auth);

  const open_website = function(e){
    const webid = e.parentNode.parentNode.id;

  }

  const share_website = function(e){
    const webid = e.parentNode.parentNode.id;
    
  }

  const delete_website = function(e){
    const webid = e.parentNode.parentNode.id;

  }

  useEffect(() =>{
    if(user){
      user.getIdToken().then(function(idToken){
        sendToken(idToken);
      });
    }

  },[]);

  return(
  <div>    
    <div id="navbar" class="flex-col-1 top-navbar">
      <button id="add_new_website" class="add-web-button button-transition" type="button"></button>
      <div id="user" class="username-font">Default Username</div>
    </div>
    <div id="websites_display" class="flex-col-1 websites-display">
      <div class="website flex-col-5">
        <div class="website-name">Website 1</div>
        <button type="button" className="website-go button-transition" onClick={(e)=>{open_website(e)}}></button>
        <button type="button" className="website-share button-transition" onClick={(e)=>{share_website(e)}}></button>
        <button type="button" className="website-delete button-transition" onClick={(e)=>{delete_website(e)}}></button>
      </div>
    </div>
  </div>);
}