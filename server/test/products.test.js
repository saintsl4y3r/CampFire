import {describe, expect, test} from '@jest/globals';
import {GraphQLClient} from 'graphql-request';
import dotenv from 'dotenv';

dotenv.config();

const client = new GraphQLClient("http://localhost:4000/")

describe('Products GraphQL API', () => {

    // Get All Products
    test('get all products', async () => {

        // graphql query
        const query = `#graphql 
        query GetAllProducts ($first: Int, $offset: Int){
            products (first: $first, offset: $offset, condition:{
                name: "Na"
                price: {
                min: 3
                max: 99.99
                }
            }) {
                nodes {
                    _id
                    name
                    price
                    categoryName
                    categoryId
                    manufacturerName
                    manufacturerId
                }
                totalCount
            }
        }
        `;

        // query variables
        const variables = {
            "first": 10,
            "offset": 3,
        }

        let data = {};

        try {
            // execute the query
            data = await client.request(query, variables);

        } catch (e) {
            // report the error
            console.log(e)
        }

        expect(data?.products).toBeDefined();
        expect(data?.products).toHaveProperty("nodes");
        expect(data?.products).toHaveProperty("totalCount");

    });

    // Create Product
    test('create product', async () => {
        const query = `#graphql
        mutation CreateProduct ($input: ProductInput!) {
            createProduct(input: $input) {
                _id
                name
                price
                categoryId
                manufacturerId
            }
        }
        `;

        // query variables
        const variables = {
            "input": {
                "name": "GX347",
                "price": 39.99,
                "categoryId": "685f7ad0e0d53b0bb751be2e",
                "manufacturerId": "68674558c51b88acaa8a2d7e"
            }
        }

        // headers
        const headers = {
            "Authorization": `Bearer ${process.env.ADMIN_JWT_TOKEN}`
        }

        let data = {};

        try {
            data = await client.request(query, variables, headers);
        } catch (e) {
            console.log(e);
        }
    });

});
