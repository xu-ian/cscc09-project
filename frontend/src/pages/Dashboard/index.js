import "./style.css";
import "../../App.css";
import {
  signOut
} from "firebase/auth";
import { auth } from '../../firebase'
function Dashboard() {
  
  const logout = () => {
    signOut(auth);
  };


  return (
    <div className="main-container">
      dashborad
      <button onClick={logout}>sign out</button>
    </div>
  );
}

export default Dashboard;
