import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { schema } from "./graphql/schema.js";
import { useGraphQLMiddleware } from "@envelop/graphql-middleware";
import { permissions } from "./permissions.js";
import { db } from "./config.js";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { initDatabase } from "./data/init.js";
await initDatabase();

const signingKey = process.env.JWT_SECRET;
import jwt from "jsonwebtoken";

import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = '1002324308191-1e5r19msbehhnuo7sjrij0dpcmboc19c.apps.googleusercontent.com'; // Put your client ID in .env

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const app = express();

app.use('/img', express.static(path.join(__dirname, 'img')));

const yoga = createYoga({ 
    schema,
    graphqlEndpoint: "/",
    plugins: [useGraphQLMiddleware([permissions])],

    // context: async ({ request }) => {
    //     return {
    //       db: db,
    //       secret: request.headers.get("secret") ?? "",
    //     };
    //   },

    context: async ({ request }) => {
      const authorization = request.headers.get("authorization") ?? "";
      let user = null;
      if (authorization.startsWith("Bearer")) {
        const token = authorization.substring(7);
        try {
          user = jwt.verify(token, signingKey);
        } catch (e) {
          user = null;
        }
      }
      const headers = {};
      for (const [key, value] of request.headers.entries()) {
        headers[key] = value;
      }
      return {
        db: db,
        user: user,
        headers,
      };
    },

    cors: {
      origin: "*",
      credentials: true,
      allowedHeaders: ["X-Custom-Header", "content-type", "authorization"],
      methods: ["POST"],
    },
  }
);

const server = createServer(yoga);

app.get("/img/:filename", (req, res) => {
  const filename = req.params.filename;
  const pathDir = path.join(__dirname, "/img/" + filename);

  // TODO: kiểm tra file tồn tại hay không
  res.sendFile(pathDir);
});

app.use(express.json()); // Ensure you can parse JSON bodies

app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Kiểm tra email đã có trong hệ thống chưa
    const user = await db.users.findOne({ email });

    if (user) {
      // Đăng nhập
      const jwtToken = jwt.sign({ 
        id: user.id, 
        role: user.role,
        email: user.email,
        name: user.name,
        picture: user.picture
      }, signingKey, { expiresIn: '7d' });
      res.json({ status: 'ok', jwt: jwtToken, user });
    } else {
      // Trường hợp user chưa có tài khoản
      res.json({
        status: 'new_user',
        user: { email, name, picture }
      });
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.use(yoga.graphqlEndpoint, yoga);



const PORT = 4000; // process.env.PORT
server.listen(PORT, () => {
  console.info(`Server is running on http://localhost:${PORT}`);
});