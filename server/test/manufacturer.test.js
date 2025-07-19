import {describe, expect, test} from '@jest/globals';
import {GraphQLClient} from 'graphql-request';
import dotenv from 'dotenv';

dotenv.config();

const client = new GraphQLClient("http://localhost:4000/")

describe('Manufacturers GraphQL API', () => {
    // Get All Manufacturers
    test('get all manufacturers', async () => {
        const query = `#graphql
        query GetAllManufactures{
            manufacturers{
                _id
                name
            }
        }
        `;

        let data = {};

        try {
            data = await client.request(query);
        } catch (e) {
            console.log(e);
        }
    })

    // Create Manufacturer
    test('create manufacturer', async () => {
        const query = `#graphql
        mutation CreateManufacturer($input: ManufacturerInput!) {
            createManufacturer(input: $input) {
                _id
                name
            }
        }
        `;
        
        const variables = {
            "input": {
                "name": "ChannelLock"
            }
        }

        const headers = {
            "Authorization": `Bearer ${process.env.ADMIN_JWT_TOKEN}`
        }

        let data = {};

        try {
            data = await client.request(query, variables, headers);
        } catch (e) {
            console.log(e);
        }
    })
    
})