'use client'
import React from "react";

function Credits(){
  return (
    <div>
      <header>
        <a href="/" id="title">Webgallery</a>
      </header>
      <h1>Credits</h1>
      <h2>SVG Images</h2>
      <ul>
        <li>
          Icons created in SVG Path Editor <a href="https://yqnn.github.io/svg-path-editor/" title="SVG Path Editor">
            https://yqnn.github.io/svg-path-editor/
          </a> which is made by <a href="https://github.com/Yqnn" title="YQNN's github page" target="_blank">
            YQNN
          </a>
        </li>
        <li>
          Framework for website builder uses 3rd party package grapesJS <a href="https://grapesjs.com/" title="GrapesJS">
            https://grapesjs.com/
          </a> which is made by <a href="https://github.com/artf" title="Artur Arseniev's github page">
              Artur Arseniev
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Credits;