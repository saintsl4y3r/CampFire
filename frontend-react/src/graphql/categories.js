import { gql } from "@apollo/client";

export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    categories(first: 22, offset: 0) {
      nodes {
        _id
        name
      }
    }
  }
`;

export const GET_CATEGORY_BY_ID = gql`
  query GetCategoryById($id: ID!) {
    category(id: $id) {
      _id
      name
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      category {
        _id
        name
      }
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: ID!, $first: Int, $offset: Int) {
    productsByCategory(
      categoryId: $categoryId
      first: $first
      offset: $offset
    ) {
      nodes {
        _id
        name
        price
        categoryId
        categoryName
        manufacturerId
        manufacturerName
        imageUrl
      }
      totalCount
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      category {
        _id
        name
      }
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($input: DeleteCategoryInput!) {
    deleteCategory(input: $input) {
      success
    }
  }
`;
