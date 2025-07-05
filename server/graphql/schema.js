import { createSchema } from "graphql-yoga";
import _ from "lodash";

// hello
import { typeDef as hello, resolvers as helloResolvers } from "./hello.js";

// shop
import { typeDef as categories, resolvers as categoriesResolvers } from "./categories.js";
import { typeDef as products, resolvers as productsResolvers } from "./products.js";
import { typeDef as manufacturers, resolvers as manufacturersResolvers } from "./manufacturer.js";
import { typeDef as details, resolvers as detailsResolvers } from "./detail.js";

// orders (Admin)
import { typeDef as orders, resolvers as ordersResolvers } from "./orders.js";
import { typeDef as upload, resolvers as uploadResolvers } from "./upload.js";
import { typeDef as authentication, resolvers as authenticationResolvers } from "./authentication.js";

const query = `
  scalar DateTime

  enum OrderStatus {
    PENDING     # chưa thanh toán
    PAID        # đã thanh toán
    CANCELLED   # hủy
  }

  type OrderItem {
    id: ID!
    productId: ID!
    name: String!
    quantity: Int!
    price: Float!
  }

  type Order {
    id: ID!
    customerName: String!
    customerPhone: String!
    status: OrderStatus!
    total: Float!
    createdAt: DateTime!
    isDeleted: Boolean!
    items: [OrderItem!]!
  }

  type OrderPage {
    items: [Order!]!
    totalCount: Int!
  }

  input OrderItemInput {
    productId: ID!
    name: String!
    quantity: Int!
    price: Float!
  }

  input CreateOrderInput {
    customerName: String!
    customerPhone: String!
    items: [OrderItemInput!]!
  }

  input UpdateOrderInput {
    customerName: String
    customerPhone: String
    status: OrderStatus
  }

  input UpdateOrderItemInput {
    name: String
    quantity: Int
    price: Float
  }

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

const typeDefs = [
  query,
  hello,
  categories,
  products,
  manufacturers,
  details,
  orders,          
  upload,
  authentication
];

const resolvers = _.merge(
  helloResolvers,
  categoriesResolvers,
  productsResolvers,
  manufacturersResolvers,
  detailsResolvers,
  ordersResolvers, 
  uploadResolvers,
  authenticationResolvers
);

export const schema = createSchema({
  typeDefs,
  resolvers,
});
