'use client'
import { useState, useEffect } from "react";
import WebBuilderLogo from '../../images/webbuilderlogo.png'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { query, getDocs, collection, where, addDoc } from "firebase/firestore";
import { auth, db } from '../../api/firebase'
import { useRouter } from "next/navigation";
import Image from 'next/image'
import { useAuthState } from "react-firebase-hooks/auth";
// import "../../app/globals.css";

function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");
  const [errorMessage, seterrorMessage] = useState("");
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (loading) {
      // maybe trigger a loading screen
      return;
    }
    if (user) router.push("/sites");
  }, [user, loading]);

  const signInWithGoogle = async () => {
    const googleProvider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const docs = await getDocs(q);
      if (docs.docs.length === 0) {
        await addDoc(collection(db, "users"), {
          uid: user.uid,
          name: user.displayName,
          authProvider: "google",
          email: user.email,
        });
      }
      router.push("/sites");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const logInWithEmailAndPassword  = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/sites");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="sl-main-container">
      <form className="sl-form-container" onSubmit={(e) => e.preventDefault()}>
        <Image className="sl-sign-logo" src={WebBuilderLogo} alt="WebBuilder Logo" />
        <div className="sl-error-mess">{errorMessage}</div>
        <div className="sl-form-controll">          
          <label>Email</label>
          <input
            type="text"
            placeholder="Please enter your username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
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
          value="Sign In"
          onClick={() => {logInWithEmailAndPassword (email, password)}}
          />
                or
          <div className="sl-others" onClick={() => {signInWithGoogle()}}>
            Sign in with Google
          </div>
          {/* <div className="sl-others" onClick={() => {signUpWithGoogle()}}>
            Sign up with FaceBook
          </div>
          <div className="sl-others" onClick={() => {}}>
            Sign up with X
          </div> */}
      </form>
    </div>
  );
}

export default Login;
