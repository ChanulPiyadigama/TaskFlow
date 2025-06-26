import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Auth/Login'
import {jwtDecode} from 'jwt-decode'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './components/HomePage'
import StudySessionPage from './components/CreatingStudySession/StudySessionPage'
import AdminPage from './components/Auth/AdminActions'
import UserPage from './components/UserPage/UserPage'
import AppLayout from './Layouts/AppLayout'
import { Loader } from '@mantine/core'
import CustomModal from './Layouts/CustomModal'
import Register from './components/Auth/Register'
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import { useApolloClient } from '@apollo/client'

function App() {

  const { user, setToken, setUser } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const client = useApolloClient()

  const handleLogout = async () => {
    try {
      // Clear the Apollo Client cache
      await client.clearStore()
    } catch (error) {
      console.error('Error during logout:', error)
    }
    setToken(null)
    setUser(null)
    localStorage.removeItem('user-token')
  }
  
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
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return  <Loader />
  }
  


  //when the useEffect is done and checks for a user through the saved token, if no user go to login page
  //else render layout and other pages
  return (
    <Router>
      <CustomModal />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={!user ? <ResetPassword /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route element={user ? <AppLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/StudySession/:id" element={<StudySessionPage />} />
          <Route path="/UserPage/:userId" element={<UserPage />} />
        </Route>
      </Routes>
    </Router>
  )
  
}

export default App
