import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import {jwtDecode} from 'jwt-decode'
import TimerList from './components/TimerList'

function App() {
  //when login works, token and user are set for context, rendering the app with user
  const { token, user, setToken, setUser } = useAuth()
  
  //set token and user from local storage if they exist, rerendering app to not show login page
  useEffect(() => {
    const token = localStorage.getItem('user-token')
    if (token) {
      setToken(token)
      const decodedToken = jwtDecode(token)
      setUser(decodedToken)
    }
  }
  , [])



  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('user-token')
  }

  return (
    token ? (
      <div>
        <h1>Hey {user.user}!</h1>
        <TimerList />
        <button onClick={handleLogout}>Logout</button>
      </div>
    ) : (
      <Login />
    )
  )
  
}

export default App
