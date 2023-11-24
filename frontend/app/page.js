"use client";

import React from "react";
import WebBuilderLogo from "../images/webbuilderlogo.png";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="sl-main-container">
      <Image
        src={WebBuilderLogo}
        alt="WebBuilder Logo"
        width={200}
        height={200}
        priority
      />
      <div className="main-header">&lt; WELCOME TO WEB BUILDER /&gt;</div>
      <div className="slogon-text">
        <hr />
        A Coloaborative Website Building Application, where dreams turn into
        reality!
        <hr />
      </div>
      <div className="main-row">
        <button
          className="sl-sign-up-btn"
          onClick={() => {
            router.push("/login");
          }}
        >
          Sign In
        </button>
        <button
          className="sl-sign-up-btn"
          onClick={() => {
            router.push("/signup");
          }}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
