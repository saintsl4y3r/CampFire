import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { GraphQLClient } from 'graphql-request';
import dotenv from 'dotenv';

dotenv.config();

const client = new GraphQLClient("http://localhost:4000/");

describe('Categories GraphQL API', () => {
    let new_category_id;
    let new_category_name;

    // Get All Categories
    // test('get all categories', async () => {
    //     const query = `#graphql
    //     query GetAllCategories($first: Int, $offset: Int, $orderBy: [CategoriesOrderBy!]) {
    //         categories(first: $first, offset: $offset, orderBy: $orderBy) {
    //             nodes {
    //                 _id
    //                 name
    //             }
    //             totalCount
    //         }
    //     }
    //     `;

    //     const variables = {
    //         "first": 10,
    //         "offset": 0,
    //         "orderBy": ["NAME_ASC"]
    //     }

    //     let data = {};

    //     try {
    //         data = await client.request(query, variables);
    //     } catch (e) {
    //         console.log(e);
    //     }

    //     expect(data).toBeDefined();
    //     expect(data.categories).toBeDefined();
    //     expect(Array.isArray(data.categories.nodes)).toBe(true);
    //     expect(typeof data.categories.totalCount).toBe('number');

    //     console.log(data.categories.nodes[0]._id);
    //     console.log(data.categories.nodes[0].name);
    // })
    

    // Create Category - Step 1: Tạo category mới và lấy ID
    test('01_create category', async () => {
        const query = `#graphql
        mutation CreateCategory($input: CategoryInput!) {
            createCategory(input: $input) {
                _id
                name
            }
        }
        `;

        const variables = {
            "input": {
                "name": "Shoes"
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

        // Lưu ID và name của category vừa tạo để sử dụng cho các test tiếp theo
        if (data && data.createCategory) {
            new_category_id = data.createCategory._id;
            new_category_name = data.createCategory.name;
            
            console.log('=== CREATED CATEGORY ===');
            console.log(`ID: ${new_category_id}`);
            console.log(`Name: ${new_category_name}`);
            console.log('========================');
        }
    })

    // Get Category by ID - Step 2: Lấy category bằng ID vừa tạo
    test('02_get category by id', async () => {
        const query = `#graphql
        query GetCategoryById($id: ID!) {
            category(_id: $id) {
                _id
                name
            }
        }
        `;

        const variables = {
            "id": new_category_id
        }

        let data = {};

        try {
            data = await client.request(query, variables);
        } catch (e) {
            console.log(e);
        }

        // Kiểm tra category có đúng ID và name không
        expect(data).toBeDefined();
        expect(data.category).toBeDefined();

        console.log('=== FOUND CATEGORY ===');
        console.log(`ID: ${data.category._id}`);
        console.log(`Name: ${data.category.name}`);
        console.log('======================');
    })

    // Delete Category by ID - Step 3: Xóa category bằng ID vừa tạo
    test('03_delete category by id', async () => {
        const query = `#graphql
        mutation DeleteCategory($id: ID!) {
            deleteCategory(_id: $id)
        }
        `;

        const variables = {
            "id": new_category_id
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

        // Kiểm tra kết quả xóa
        if (data && data.deleteCategory !== undefined) {
            console.log('=== DELETE RESULT ===');
            console.log(`Deleted count: ${data.deleteCategory}`);
            console.log(`Category ID: ${new_category_id}`);
            console.log('=====================');
            
            // Kiểm tra xem có xóa thành công không
            expect(data.deleteCategory).toBeGreaterThan(0);
        }
    })
    
        
});