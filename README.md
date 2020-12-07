# Merng



nvm use v12.19.0

models>>>
create datbase models to use them to interface the database with


index.js
// const typeDefs = gql`
//     type Post {
//         id: ID!
//         body: String!
//         username: String!
//         createdAt: String!
//     }
//     type Query {
//         getPosts: [Post]
//     }
// `;
// const resolvers = {
//     Query : {
//         async getPosts(){
//             try {
//                 const posts = await Post.find();
//                 return posts;
//             } catch (err){
//                 throw new Error (err); 
//             }
//         }
//     }
// };