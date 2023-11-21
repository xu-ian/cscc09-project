'use client'
import "./style.css";
import { getPing } from '../../api/logic/api.mjs'
import {
  signOut
} from "firebase/auth";
import { auth } from '../../api/firebase'
function Dashboard() {
  
  const logout = () => {
    signOut(auth);
  };


  return (
    <div className="main-container">
      dashborad
      <button onClick={logout}>sign out</button>
      <button onClick={getPing}>ping</button>
    </div>
  );
}

export default Dashboard;
