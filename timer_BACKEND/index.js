import { MONGODB_URI } from "./util/config.js";
import mongoose from "mongoose";
import express from "express";
import { ApolloServer } from "@apollo/server";
import typeDefs from "./schemas.js";
import resolvers from "./resolvers.js";
import http from 'http';
import cors from 'cors';
import { makeExecutableSchema } from "@graphql-tools/schema";
import { expressMiddleware } from "@apollo/server/express4";
import jwt from 'jsonwebtoken';
import { SECRET } from "./util/config.js";

import User from "./models/User.js";
// Connect to MongoDB
const connectDB = async () => {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log(' Connected to MongoDB');
    } catch (error) {
      console.error(' Error connecting to MongoDB:', error.message);
      process.exit(1);
    }
};

connectDB();

const start = async () => {
    const app = express()
    //create a http server, and have the express app handle incoming requests
    const httpServer = http.createServer(app)

    //create the apolloserver to handle graphql requests
    const server = new ApolloServer({
        schema: makeExecutableSchema({ typeDefs, resolvers }),
    })

    //ensure apollo server is started before handlign requests
    await server.start()


    app.options('*', (req, res) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.sendStatus(200);
    });


    //request run through middleware, including graphql server, all http requests are post reqs sent to '/' with a body of a
    //graphql query, which allows graphql to extract specific data to return
    app.use(
        '/',
        cors({
            origin: [
                'https://task-flow0.netlify.app',  
                'https://2345254563.work',
                'http://2345254563.work',       
                'http://localhost:3000',           
                'http://localhost:5173',           
            ],
            credentials: true,
            methods: ['GET', 'POST', 'OPTIONS'],           
            allowedHeaders: ['Content-Type', 'Authorization'], 
            preflightContinue: false,                   
            optionsSuccessStatus: 200                   
        }),
        express.json(),
        expressMiddleware(server, {
            //context attaches decoded user from token to each req so we can access it in resolvers, 
            //if no authheader, currentUser is null
            context: async ({ req }) => {
                const authHeader = req.headers.authorization;
                if (authHeader?.startsWith("Bearer ")) {
                  const token = authHeader.substring(7);
                  try {
                    const decodedToken = jwt.verify(token, SECRET);
                    const user = await User.findById(decodedToken.id);
                    return { currentUser: user };
                  } catch (error) {
                    console.error(' Invalid or expired token:', error.message);
                  }
                }
                return { currentUser: null };
              },
        })
    )

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });

}

start();