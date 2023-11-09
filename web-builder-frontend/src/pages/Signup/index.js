import { useState } from "react";
import WebBuilderLogo from '../../images/WebBuilderLogo.png'
import "../../App.css";

function Signup() {
  const [user, setUser] = useState("");
  const [password, setpassword] = useState("");
  const [errorMessage, seterrorMessage] = useState("");

  return (
    <div className="sl-main-container">
      <form className="sl-form-container" onSubmit={(e) => e.preventDefault()}>
        <img className="sl-sign-logo" src={WebBuilderLogo} alt="WebBuilder Logo" />
        <div className="sl-error-mess">{errorMessage}</div>
        <div className="sl-form-controll">
          <label>Username</label>
          <input
            type="text"
            placeholder="Please enter your username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            />
        </div>
        <div className="sl-form-controll">
          <label>Password</label>
          <input
            type="password"
            placeholder="Please enter your password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            />
        </div>
          <input
          className="sl-sign-up-btn"
          type="submit"
          value="Sign Up"
          onClick={() => {}}
          />
                or
      <div className="sl-others">
        Sign up with Google
      </div>
      </form>
    </div>
  );
}

export default Signup;
