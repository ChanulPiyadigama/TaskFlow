import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import {jwtDecode} from 'jwt-decode'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './components/HomePage'
import StudySessionPage from './components/StudySessionPage'
import AdminPage from './components/AdminPage'

function App() {

  const { token, setToken, setUser } = useAuth()
  
  //set token and user from local storage if they exist, check token first tho
  useEffect(() => {
    const token = localStorage.getItem('user-token')
    if (token) {
      //first check if token is expired, if not set token and user from decoded token info
      const decodedToken = jwtDecode(token)
      const currentTime = Date.now() / 1000
      if (decodedToken.exp < currentTime){
        handleLogout()
      } else{
        setToken(token)
        setUser(decodedToken)
      }

    }
  }, [])


  
  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('user-token')
  }


  //when the app first starts we check if a token exists/is valid, if not the user must login 
  return (
    <Router>
      <Routes>
        <Route path='/' element={token? <HomePage /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/StudySession/:id" element={<StudySessionPage />} />
        <Route path="/admin" element={<AdminPage/>} />
      </Routes>
    </Router>
  )
  
}

export default App
