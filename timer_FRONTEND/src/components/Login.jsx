import { LOGIN } from "../queries"
import { useMutation } from "@apollo/client"
import { useAuth } from "../context/AuthContext"
import { useEffect } from "react"
import {jwtDecode} from "jwt-decode"

export default function Login() {

    //the useMutation triggers rerenders,  when the mutation is called the componet rerenders for every response,
    //immediatley we get a response with loading true, then another with loading false and the actual data, and/or and error, triggering
    //the second rerender
    const { setToken, setUser } = useAuth()
    const [login, {loading, data, error}] = useMutation(LOGIN, {
        onError: (error) => {
            console.log(error)
        }
    })

    //once we get data, token is set, decoded to set user and then whole app is rerendered, setToken is also a dependency because
    //if we ever change how setToken works, we want to set the token again differently for the app
    useEffect(() => {
        if (data) {
            const token = data.login;
            setToken(token);
            localStorage.setItem("user-token", token);

            //decode the token to get the user info, (cant change the token without the secret, only server can)
            const decodedToken = jwtDecode(token);
            setUser(decodedToken);
            
        }
    }, [data, setToken]); 

    const handleLogin = async (e) => {
        e.preventDefault()
        const username = e.target.username.value
        const password = e.target.password.value

        login({ variables: { username, password } })
        e.target.username.value = ''
        e.target.password.value = ''

    }

    return (
        <form onSubmit={handleLogin}>
            <h1>Login</h1>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" required />
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />

            {loading ? (
                <p>Logging in...</p>
            ) : (
                <button type="submit">Login</button>
            )}
        </form>
    )
}