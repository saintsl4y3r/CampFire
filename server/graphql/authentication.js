import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });

export const typeDef = `
    type LoginResult {
        jwt: String!
    }

    type LoginResponse {
        success: Boolean!
        message: String!
        data: LoginResult
    }

    input LoginInput {
      username: String!
      password: String!
    }

    extend type Mutation {
        login(input: LoginInput): LoginResponse
    }
`;

export const resolvers = {
  Mutation: {
    login: async (parent, args, context, info) => {
      var { username, password } = args.input;
      if (username.length == 0 || password == 0) {
        return {
          success: false,
          message: "Username or password cannot be empty",
        };
      }

      var user = await context.db.users.findOne(username);

      if (!user) {
        return {
          success: false,
          message: "Invalid username or password",
        };
      }

      var isOkay = await bcrypt.compare(password, user.password);
      if (isOkay) {
        var token = jwt.sign(
          {
            username: user.username,
            role: user.role,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "24h",
          }
        );

        return {
          success: true,
          message: "Login successfully",
          data: {
            jwt: token,
          },
        };
      }

      return {
        success: false,
        message: "Invalid username or password",
      };
    },
  },
};