'use client'
import { query, getDocs, collection, where, addDoc } from "firebase/firestore";
import { useEffect, forceUpdate, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  signOut
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { sendToken, getSites, addSite, removeSite, updateUser, setSite } from "@/api/logic/api.mjs";
import { auth, db } from '../../api/firebase.js'

import "./style.css"

export default function Websites(){

  const [user, loading, error] = useAuthState(auth);
  const [sites, setSites] = useState([]);
  const [username, setUsername] = useState("Default Username");

  const router = useRouter();

  useEffect(() => {
    if (loading) {
      // maybe trigger a loading screen
      return;
    }
    if (!user) router.push("/");
  }, [user, loading]);

  const updateSites = function(){
    getSites(function(err, res){
      if(err) console.log(err);
      else {
        const sites = [];
        res.sites.forEach(function(site){
          sites.push(
            <div id={site.webId} key={site.webId} className="website flex-col-5">
              <div className="website-name">{site.webId}</div>
              <button type="button" className="website-go button-transition" onClick={(e)=>{open_website(e)}}></button>
              <button type="button" className="website-share button-transition" onClick={(e)=>{share_website(e)}}></button>
              <button type="button" className="website-delete button-transition" onClick={(e)=>{delete_website(e)}}></button>
            </div>);
        });
        setSites(sites);
      }
    });
  };

  const open_website = function(e){
    console.log(e);
    const webid = e.target.parentNode.id;
    setSite(webid, function(err, res){
      if(!err){
        window.location = "/builder";
      }
    });
  }

  const logout = () => {
    signOut(auth);
  };

  const share_website = function(e){
    console.log(e);
    const webid = e.target.parentNode.id;
    const userid = ""; // Get this from somewhere
    updateUser(webid, userid, function(err, res){
      if(!err){
        console.log("Success");
      }
    });
  }

  const make_website = function(){
    addSite(function(err, res){
      if(!err){
        console.log(res);
        updateSites();
      }
    });
  }

  const delete_website = function(e){
    console.log(e);
    const webid = e.target.parentNode.id;
    removeSite(webid, function(err, res){
      if(!err){
        updateSites();
      }
    });
  }

  useEffect(() =>{
    if(user){
      user.getIdToken().then(function(idToken){
        sendToken(idToken, async function(err, res){
          const q = query(collection(db, "users"), where("uid", "==", user.uid));
          const docs = await getDocs(q);
          setUsername(docs.docs[0].data().name + " (uid: " + res.uid + ")");
          if(err) console.log(err);
          else {
            updateSites();
          }
        });
      });
    }
  },[user]);

  return (
    <div>
      <div id="navbar" className="flex-col-1 top-navbar">
        <div className="group">
          <div id="user" className="username-font">
            {username}
          </div>
          <button className="sign-out" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>
      <div id="websites_display" className="websites-display">
        <button
          className="add-web-button button-transition"
          type="button"
          onClick={(e) => {
            make_website(e);
          }}
        >
          Add New Website
          <div
            className="add-web-button-img button-transition"
          ></div>
        </button>
        {sites}
      </div>
    </div>
  );
}