import logo from './logo.svg';
import './App.css';

import Builder from './components/builder.js'
import Credits from './components/credits.js'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path:"/credits",
    element: <Credits />
  },
  {
    path:"/",
    element: <Builder />
  }
])

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
