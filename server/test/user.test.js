import {describe, expect, test} from '@jest/globals';
import {GraphQLClient} from 'graphql-request';
import dotenv from 'dotenv';

dotenv.config();

const client = new GraphQLClient("http://localhost:4000/")

    describe('User GraphQL API', () => {
    // Login
    test('login', async () => {
        const query = `#graphql
        mutation Login($input: LoginInput!) {
            login(input: $input) {
                success
                message
                data {
                    jwt
                    role
                }
            }
        }
        `;

        // query variables
        const variables = {
            // // admin
            // "input": {
            //     "username": "admin",
            //     "password": "1234"
            // }

            // user
            "input": {
                "username": "bob",
                "password": "1234"
            }
        }

        let data = {};

        try {
            data = await client.request(query, variables);
        } catch (e) {
            console.log(e);
        }

    expect(data?.login?.data?.jwt).toBeDefined();
    console.log('JWT:', data?.login?.data?.jwt);
    });
});