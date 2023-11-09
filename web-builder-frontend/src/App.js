import './App.css';

import Builder from './components/builder.js'
import Credits from './components/credits.js'
import Test from "./components/test.js"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"

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
  },
  {
    path:"/test",
    element: <Test />
  },
  {
    path:"/login",
    element: <Login />
  },
  {
    path:"/signup",
    element: <Signup />
  },
  {
    path:"/dashboard",
    element: <Dashboard />
  }
])

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
