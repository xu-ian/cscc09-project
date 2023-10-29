import React from "react";
import { useEffect } from "react";
import grapesjs, { Editor } from 'grapesjs';
import GjsEditor, { Canvas } from '@grapesjs/react';

import styleManagerData from './logic/styleManagerData.mjs'
import blockManagerData from "./logic/blockManagerData.mjs";

import 'grapesjs/dist/css/grapes.min.css'
import './styles/main.css'

import { setupEditor } from "./logic/editorLogic.mjs";

function Builder() {
  

  const onEditor = (editor) => {
    console.log('Editor loaded', { editor });
    setupEditor(editor);
  };

  return (
    <div>    
      <GjsEditor
        grapesjs={grapesjs}
        grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
        options={{
          height:'490pt',
          container : '#gjs',
          fromElement: true,
          showOffsets: true,
          canvas: {
            styles: ['http://localhost:5000/stylesheet/main'],    
          },
          //StorageManager: false,
          selectorManager: { componentFirst: true },
          styleManager: {
            sectors: styleManagerData
          },
          blockManager: { /* These are blocks in the editor and the general format they are created in */
            blocks: blockManagerData,
          },
        }}
        onEditor={onEditor}
      >

      </GjsEditor>
      <div class="row" style={{'min-height':'10px'}}>
        <a class="centered" href="credits">credits</a>
        <a class="centered" href="test">test</a>
      </div>
    </div>
  )
}

export default Builder;