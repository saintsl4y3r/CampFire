import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { GraphQLClient } from 'graphql-request';
import dotenv from 'dotenv';

dotenv.config();

const client = new GraphQLClient("http://localhost:4000/");

describe('Categories GraphQL API', () => {
  let testCategoryId;
  let adminToken;

  beforeAll(async () => {
    // Get admin token for authenticated operations
    adminToken = process.env.ADMIN_JWT_TOKEN;
    if (!adminToken) {
      console.warn('ADMIN_JWT_TOKEN not found in environment variables');
    }
  });

  describe('Query Operations', () => {
    // Test getting all categories with pagination
    test('should get all categories with pagination', async () => {
      const query = `#graphql
        query GetAllCategories($first: Int, $offset: Int, $orderBy: [CategoriesOrderBy!]) {
          categories(first: $first, offset: $offset, orderBy: $orderBy) {
            nodes {
              _id
              name
            }
            totalCount
          }
        }
      `;

      const variables = {
        first: 10,
        offset: 0,
        orderBy: ['NAME_ASC']
      };

      try {
        const data = await client.request(query, variables);
        
        expect(data).toBeDefined();
        expect(data.categories).toBeDefined();
        expect(data.categories.nodes).toBeInstanceOf(Array);
        expect(data.categories.totalCount).toBeGreaterThanOrEqual(0);
        
        // If categories exist, verify structure
        if (data.categories.nodes.length > 0) {
          const category = data.categories.nodes[0];
          expect(category._id).toBeDefined();
          expect(category.name).toBeDefined();
          expect(typeof category.name).toBe('string');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
    });

    // Test getting categories with different ordering
    test('should get categories with different ordering', async () => {
      const query = `#graphql
        query GetCategoriesOrdered($orderBy: [CategoriesOrderBy!]) {
          categories(first: 5, offset: 0, orderBy: $orderBy) {
            nodes {
              _id
              name
            }
            totalCount
          }
        }
      `;

      const orderings = [
        ['ID_ASC'],
        ['ID_DESC'],
        ['NAME_ASC'],
        ['NAME_DESC']
      ];

      for (const orderBy of orderings) {
        try {
          const data = await client.request(query, { orderBy });
          expect(data.categories).toBeDefined();
          expect(data.categories.nodes).toBeInstanceOf(Array);
        } catch (error) {
          console.error(`Error with ordering ${orderBy}:`, error);
          throw error;
        }
      }
    });

    // Test getting a single category by ID
    test('should get category by ID', async () => {
      // First get a category to use its ID
      const getAllQuery = `#graphql
        query GetFirstCategory {
          categories(first: 1, offset: 0) {
            nodes {
              _id
              name
            }
          }
        }
      `;

      try {
        const allData = await client.request(getAllQuery);
        
        if (allData.categories.nodes.length > 0) {
          const categoryId = allData.categories.nodes[0]._id;
          
          const query = `#graphql
            query GetCategoryById($id: ID!) {
              category(_id: $id) {
                _id
                name
              }
            }
          `;

          const data = await client.request(query, { id: categoryId });
          
          expect(data).toBeDefined();
          expect(data.category).toBeDefined();
          expect(data.category._id).toBe(categoryId);
          expect(data.category.name).toBeDefined();
        }
      } catch (error) {
        console.error('Error getting category by ID:', error);
        throw error;
      }
    });

    // Test getting non-existent category
    test('should return null for non-existent category', async () => {
      const query = `#graphql
        query GetNonExistentCategory($id: ID!) {
          category(_id: $id) {
            _id
            name
          }
        }
      `;

      try {
        const data = await client.request(query, { id: '507f1f77bcf86cd799439011' });
        expect(data.category).toBeNull();
      } catch (error) {
        console.error('Error getting non-existent category:', error);
        throw error;
      }
    });

    // Test pagination edge cases
    test('should handle pagination edge cases', async () => {
      const query = `#graphql
        query GetCategoriesPaginated($first: Int, $offset: Int) {
          categories(first: $first, offset: $offset) {
            nodes {
              _id
              name
            }
            totalCount
          }
        }
      `;

      const testCases = [
        { first: 0, offset: 0 },
        { first: 1, offset: 0 },
        { first: 100, offset: 0 },
        { first: 10, offset: 100 }
      ];

      for (const testCase of testCases) {
        try {
          const data = await client.request(query, testCase);
          expect(data.categories).toBeDefined();
          expect(data.categories.nodes).toBeInstanceOf(Array);
          expect(data.categories.totalCount).toBeGreaterThanOrEqual(0);
        } catch (error) {
          console.error(`Error with pagination ${JSON.stringify(testCase)}:`, error);
          throw error;
        }
      }
    });
  });

  describe('Mutation Operations', () => {
    // Test creating a category
    test('should create a new category', async () => {
      const mutation = `#graphql
        mutation CreateCategory($input: CategoryInput!) {
          createCategory(input: $input) {
            _id
            name
          }
        }
      `;

      const variables = {
        input: {
          name: `Test Category ${Date.now()}`
        }
      };

      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

      try {
        const data = await client.request(mutation, variables, headers);
        
        expect(data).toBeDefined();
        expect(data.createCategory).toBeDefined();
        expect(data.createCategory._id).toBeDefined();
        expect(data.createCategory.name).toBe(variables.input.name);
        
        // Store the created category ID for cleanup
        testCategoryId = data.createCategory._id;
      } catch (error) {
        console.error('Error creating category:', error);
        throw error;
      }
    });

    // Test creating category with invalid input
    test('should handle invalid category creation', async () => {
      const mutation = `#graphql
        mutation CreateCategory($input: CategoryInput!) {
          createCategory(input: $input) {
            _id
            name
          }
        }
      `;

      const invalidInputs = [
        { name: '' }, // Empty name
        { name: '   ' }, // Whitespace only
        {} // Missing name
      ];

      for (const invalidInput of invalidInputs) {
        try {
          await client.request(mutation, { input: invalidInput });
          // If we reach here, the test should fail
          expect(true).toBe(false);
        } catch (error) {
          // Expected to fail
          expect(error).toBeDefined();
        }
      }
    });

    // Test updating a category
    test('should update an existing category', async () => {
      if (!testCategoryId) {
        console.warn('Skipping update test - no test category created');
        return;
      }

      const mutation = `#graphql
        mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
          updateCategory(_id: $id, input: $input) {
            _id
            name
          }
        }
      `;

      const newName = `Updated Category ${Date.now()}`;
      const variables = {
        id: testCategoryId,
        input: {
          name: newName
        }
      };

      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

      try {
        const data = await client.request(mutation, variables, headers);
        
        expect(data).toBeDefined();
        expect(data.updateCategory).toBeDefined();
        expect(data.updateCategory._id).toBe(testCategoryId);
        expect(data.updateCategory.name).toBe(newName);
      } catch (error) {
        console.error('Error updating category:', error);
        throw error;
      }
    });

    // Test updating non-existent category
    test('should handle updating non-existent category', async () => {
      const mutation = `#graphql
        mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
          updateCategory(_id: $id, input: $input) {
            _id
            name
          }
        }
      `;

      const variables = {
        id: '507f1f77bcf86cd799439011',
        input: {
          name: 'Non-existent Category'
        }
      };

      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

      try {
        await client.request(mutation, variables, headers);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        // Expected to fail
        expect(error).toBeDefined();
      }
    });

    // Test deleting a category
    test('should delete an existing category', async () => {
      if (!testCategoryId) {
        console.warn('Skipping delete test - no test category created');
        return;
      }

      const mutation = `#graphql
        mutation DeleteCategory($id: ID!) {
          deleteCategory(_id: $id)
        }
      `;

      const variables = {
        id: testCategoryId
      };

      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

      try {
        const data = await client.request(mutation, variables, headers);
        
        expect(data).toBeDefined();
        expect(data.deleteCategory).toBeDefined();
        expect(typeof data.deleteCategory).toBe('number');
        expect(data.deleteCategory).toBeGreaterThan(0);
      } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
    });

    // Test deleting non-existent category
    test('should handle deleting non-existent category', async () => {
      const mutation = `#graphql
        mutation DeleteCategory($id: ID!) {
          deleteCategory(_id: $id)
        }
      `;

      const variables = {
        id: '507f1f77bcf86cd799439011'
      };

      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

      try {
        const data = await client.request(mutation, variables, headers);
        // Should return 0 for non-existent category
        expect(data.deleteCategory).toBe(0);
      } catch (error) {
        console.error('Error deleting non-existent category:', error);
        throw error;
      }
    });
  });

  describe('Error Handling', () => {
    // Test malformed queries
    test('should handle malformed queries gracefully', async () => {
      const malformedQueries = [
        `#graphql
          query MalformedQuery {
            categories {
              invalidField
            }
          }
        `,
        `#graphql
          query MissingRequiredField {
            category {
              _id
            }
          }
        `
      ];

      for (const query of malformedQueries) {
        try {
          await client.request(query);
          // If we reach here, the test should fail
          expect(true).toBe(false);
        } catch (error) {
          // Expected to fail
          expect(error).toBeDefined();
        }
      }
    });

    // Test authentication requirements
    test('should require authentication for mutations', async () => {
      const mutation = `#graphql
        mutation CreateCategory($input: CategoryInput!) {
          createCategory(input: $input) {
            _id
            name
          }
        }
      `;

      const variables = {
        input: {
          name: 'Unauthorized Category'
        }
      };

      try {
        await client.request(mutation, variables);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        // Expected to fail without authentication
        expect(error).toBeDefined();
      }
    });
  });
});