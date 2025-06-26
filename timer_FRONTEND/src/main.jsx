import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client' 
import { setContext } from "@apollo/client/link/context"
import { MantineProvider } from "@mantine/core";
import '@mantine/core/styles.css'
import { ModalProvider } from "./context/ModalContext.jsx";

//links are like special middleware/functions that can be used to modify/log/etc requests


//This link sets the context of every request to include the token in the auth header, setcontext modifies the request 
//which lets us log the request parts.
const authLink = setContext((operation, { headers }) => {
  const token = localStorage.getItem("user-token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    },
  };
});

//the http link sends all requests to the specified uri
const httpLink = createHttpLink({
  uri: "https://taskflow-68l3.onrender.com", 
});

//the client is set up with a link to the server, and a cache to store data locally on the client
//the concat means that the authlink (to add auth hearder) is run then pass the request to the httplink (to send the request)
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  //response data is stored in the cache (RAM) (controllable), so that if the same query is made, the data can be returned from the cache instead of the server
  //the cache is a source of truth, and components subscribed to specific cache data through queries/mutations will rerender when that specific data changes
  cache: new InMemoryCache(),
})

//the apolloclient is like context and the apolloprovider allows the whole app to access the client
//the client is used to send queries and mutations to the server
ReactDOM.createRoot(document.getElementById("root")).render(

    <ApolloProvider client={client}>
      <AuthProvider>
        <MantineProvider 
          theme={{ colorScheme: "dark", primaryColor: "violet" }}>
          <ModalProvider>
            <App />
          </ModalProvider>  
        </MantineProvider>
      </AuthProvider>
    </ApolloProvider>

);
