import React, { createContext, useState, useContext } from 'react';

//create context, basically a global state that can be accessed by any component child eg a store 
const authContext = createContext();

//state for context is owned by authprovider, and can be accessed by any child component
export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    //wraps the children in the provider of our context (authContext), so that all children can access the context denoted by the value prop
    return (
        <authContext.Provider value={{ token, setToken, user, setUser}}>
            {children}
        </authContext.Provider>
    )
}

//useContext finds the authContext provider and returns the value prop of that provider,
//useAuth is a custom hook that shortens the useContext(authContext) to useAuth
export const useAuth = () => {
    return useContext(authContext);
}