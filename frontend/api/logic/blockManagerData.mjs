const blockManagerData = [
  {/* Image */
    id: 'image',
    label: 'Image',
    media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
            </svg>`,
    // Use `image` component
    content: { type: 'image' },
    // The component `image` is activatable (shows the Asset Manager).
    // We want to activate it once dropped in the canvas.
    activate: true,
    // select: true, // Default with `activate: true`
  },
  {/* Button */
    id: 'button',
    label: "Button",
    media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path d="M 2 15 C 2 17 22 17 22 15 L 22 8 C 22 6 2 6 2 8 
                L 2 15 M 1 18 C 1 20 23 20 23 18 L 23 16 C 23 18 1 18 1 16"/>
            </svg>`,
    content: `<input class="button centered" type="button" value="Click Me" 
               data-gjs-droppable="false" data-gjs-draggable="true" data-gjs-custom-name="Button"/>`
  },
  {/* Row */
    id: 'div',
    label: "Row",
    media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path d="M 1 1 L 1 23 L 23 23 L 23 1 L 2 1 
                       L 2 2 L 22 2 L 22 22 L 2 22 L 2 1 Z"/>
            </svg>`,
    content: `<div class="row row-cell" data-gjs-droppable="true" 
               data-gjs-draggable="true" data-gjs-custom-name="Row">
              </div>`
  },
  {/* Data Field */
    id: 'datafield',
    label: "Data Display",
    media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path d="M 1 1 L 1 4 L 6 4 L 6 13 L 8 13 L 8 4 L 13 4 L 13 1 Z"/>
              </svg>`,
    content: `<div class="output data-output centered" data-gjs-droppable="false" 
      data-gjs-draggable="true" data-gjs-custom-name="Data-Out">Placeholder</div>`
  },
  {/* Text Input */
    id: 'text-input',
    label: "Text Input",
    media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path d="M 1 23 L 23 23 L 23 21 L 1 21 Z M 1 19 
                        L 9 19 L 9 17 L 6 17 L 6 4 L 9 4 L 9 2 
                        L 1 2 L 1 4 L 4 4 L 4 17 L 1 17 Z"/>
            </svg>`,
    content: `<input class="input text-input centered" data-gjs-droppable="false" 
               data-gjs-draggable="true" data-gjs-custom-name="Text-Input">`
  },
  {/* Two Columns */
    id: 'two-row-block',
    label: '2 Columns',
    media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path d="M 1 1 L 1 23 L 12 23 L 12 1 L 2 1 
                L 2 2 L 11 2 L 11 22 L 2 22 L 2 1 Z 
                M 13 1 L 13 23 L 24 23 L 24 1 L 14 1 
                L 14 2 L 23 2 L 23 22 L 14 22 L 14 1 Z/>"
            </svg>`,
    content: `
    <div class="row row-cell" data-gjs-droppable="true" data-gjs-draggable="true" data-gjs-custom-name="Row">
      <div class="row row-cell" data-gjs-droppable="true" data-gjs-draggable="true" data-gjs-custom-name="Row"></div>
      <div class="row row-cell" data-gjs-droppable="true" data-gjs-draggable="true" data-gjs-custom-name="Row"></div>
    </div>`
  },
  {/* Form */
    id: 'the-form-block',
    label: 'Form',
    media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path d="M 2 1 A 1 1 0 0 0 1 2 L 1 22 A 1 1 0 0 0 2 23 L 22 23 
                A 1 1 0 0 0 23 22 L 23 2 A 1 1 0 0 0 22 1 L 3 1 L 3 2 L 21 2 
                C 22 2 22 2 22 3 L 22 21 C 22 22 22 22 21 22 L 3 22 C 2 22 2 22 2 21 
                L 2 3 C 2 2 2 2 3 2 L 3 1 Z M 3 4 L 20 4 L 20 6 L 3 6 Z M 3 8 L 20 8 
                L 20 10 L 3 10 Z M 3 12 L 20 12 L 20 14 L 3 14 Z/>"
            </svg>
  `,
    content: `
    <form class="generic-background form" data-gjs-droppable=".button, .input" 
     data-gjs-draggable="true" data-gjs-custom-name="Form">
      <input class="button button-class centered" type="button" value="Click Me" 
       data-gjs-droppable="false" data-gjs-draggable="true" data-gjs-custom-name="Form-Button">
    </form>`
  },
  {/* Iterative Output */
    id: 'iterative-output-block',
    label: "Iterative Output",
    media: `<svg style="width:24px; height:24px" viewBox=0 0 24 24>
              <path d="M 2 1 A 1 1 0 0 0 1 2 L 1 22 A 1 1 0 0 0 2 23 L 22 23 
                A 1 1 0 0 0 23 22 L 23 2 A 1 1 0 0 0 22 1 L 3 1 L 3 2 L 21 2 
                C 22 2 22 2 22 3 L 22 21 C 22 22 22 22 21 22 L 3 22 C 2 22 2 22 2 21 
                L 2 3 C 2 2 2 2 3 2 L 3 1 Z M 3 20 A 1 1 0 0 0 4 21 L 20 21 
                A 1 1 0 0 0 21 20 L 21 16 A 1 1 0 0 0 20 15 L 4 15 A 1 1 0 0 0 3 16 Z 
                M 3 13 A 1 1 0 0 0 4 14 L 20 14 A 1 1 0 0 0 21 13 L 21 10 A 1 1 0 0 0 20 9 
                L 4 9 A 1 1 0 0 0 3 10 L 3 13 M 4 3 A 1 1 0 0 0 3 4 L 3 7 A 1 1 0 0 0 4 8 
                L 20 8 A 1 1 0 0 0 21 7 L 21 4 A 1 1 0 0 0 20 3 Z"/>
            </svg>`,
    content: `
    <div class="row generic-background iterout" data-gjs-draggable="true" data-gjs-custom-name="Iterable">
      <div class="generic-iterable-background iteration iteroutable" data-gjs-droppable=".output" data-gjs-draggable="true" data-gjs-custom-name="Iteration"></div>
    </div>
    `

  }
];
export default blockManagerData;