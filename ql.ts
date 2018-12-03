import { GraphQLServer } from 'graphql-yoga';
// ... or using `require()`
// const { GraphQLServer } = require('graphql-yoga')

const typeDefs = `

  type Todo {
    id: Int!
    name: String!
  }
  type Query {
    searchTodos: [Todo]
    hello(name: String): String!
    hello2(name: String): String!
  }
  type Query2 {
    searchTodos: [Todo]
    hello(name: String): String!
    hello2(name: String): String!
  }
  type Post {
    _id: String
    title: String
    content: String
    comments: [Comment]
  }
  type Comment {
    _id: String
    postId: String
    content: String
    post: Post
  }
  type Mutation {
    createPost(title: String, content: String): Post
    createComment(postId: String, content: String): Comment
  }
  
`;

const resolvers = {
  Post: {
    _id(obj) {
      return 'custom id';
    },
  },
  Query: {
    hello: (_, { name }) => {
      console.log(_);
      return `Hello ${name || 'World'}`;
    }, //`Hel
    hello2: (_, { name }) => {
      console.log(_);
      return `Hello ${name || 'World'} 2`;
    }, //`Hello ${name || 'World'}`,
    searchTodos: () => {
      return [{ id: 1, name: 'todo 1' }];
    },
  },
  Mutation: {
    createPost: (_, { title, content, ...rest }, root, ast) => {
      var args = ast.fieldNodes[0].selectionSet.selections.map(
        selection => selection.name.value
      );
      console.log(args);
      return {
        _id: '1',
        title,
        content,
        comments: [],
      };
    },
    createComment: (_, { postId, content }, root, ast) => {
      // console.log(_, { title, content, rest, root, ast });
      console.log(ast.fieldNodes);
      // console.log(_, { postId, content, rest });
      // console.log(rest[1].fieldNodes);
      return {
        _id: '1',
        postId,
        content,
        post: {
          _id: 'fake post id1',
          title: 'fake post title',
          content: 'fake post content',
          comments: [],
        },
      };
    },
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log('Server is running on localhost:4000'));
