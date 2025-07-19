export const typeDef = `
    type Product {
        _id: ID!
        name: String!
        price: Float!
        categoryId: ID!
        categoryName: String!
        manufacturerId: ID!
        manufacturerName: String!
        imageUrl: String
    }

    input ProductInput {
        name: String!
        price: Float!
        categoryId: ID!
        manufacturerId: ID!
        imageUrl: String
    }


    enum ProductsOrderBy {
        ID_ASC
        ID_DESC
        NAME_ASC
        NAME_DESC
        PRICE_ASC
        PRICE_DESC
    }

    type ProductConnection {
        nodes: [Product]
        totalCount: Int
    }

    input RangeConditionInput {
        min: Float
        max: Float
    }

    input ProductConnectionInput {
        name: String
        price: RangeConditionInput
    }


    extend type Query {
        products(
            first: Int
            offset: Int
            condition: ProductConnectionInput
            orderBy: [ProductsOrderBy!] = ID_ASC
        ): ProductConnection
        product(_id: ID!): Product
        productsByCategory(categoryId: ID!, first: Int, offset: Int): ProductConnection
    }

    extend type Mutation {
        createProduct(input: ProductInput!): Product
        updateProduct(_id: ID!, input: ProductInput!): Product
        deleteProduct(_id: ID!): Int
    }
`;

export const resolvers = {
    Query: {
        products: async (parent, args, context, info) => {
            const { items, totalCount } = await context.db.products.getAll(args);
            return {
                nodes: items,
                totalCount: totalCount,
            };
        },
        product: (parent, args, context, info) => {
            return context.db.products.findById(args._id);
        },
        productsByCategory: async (parent, args, context, info) => {
            const items = await context.db.products.getAllByCategory(args);
            return {
                nodes: items,
                totalCount: items.length,
            };
        },
    },
    Product: {
        categoryName: async (parent, args, context) => {
            const category = await context.db.categories.findById(parent.categoryId);
            return category ? category.name : null;
        },
        manufacturerName: async (parent, args, context) => {
            const manufacturer = await context.db.manufacturers.findById(parent.manufacturerId);
            return manufacturer ? manufacturer.name : null;
        }
    },
    Mutation: {
        createProduct: (parent, args, context, info) => {
            return context.db.products.create(args.input);
        },
        updateProduct: (parent, args, context, info) => {
            return context.db.products.updateById(args._id, args.input);
        },
        deleteProduct: (parent, args, context, info) => {
            return context.db.products.deleteById(args._id);
        },
    },
};