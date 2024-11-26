import React from 'react'
import "./index.css"
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Dashboard from "./pages/Dashboard"
import Jobs from "./pages/Jobs"
import Login from "./pages/Login"
import PostApplication from "./pages/PostApplication"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"


const App = () => {
  return (
    <>
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path=" /dashboard" element={<Dashboard/>} />
          <Route path="/jobs" element={<Jobs/>} />
          <Route path="/post/application/:jobId" element={<PostApplication/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/Login" element={<Login/>} />
          <Route path="*" element={<NotFound/>} />
        </Routes>
        <Footer/>
      </Router>
    </>
  )
}

export default App