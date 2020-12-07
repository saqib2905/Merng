const { AuthenticationError, userInputError}  = require('apollo-server');

const Post = require('../../models/Post');
const checkAuth = require('../../utils/check-auth');

console.log('hello');
module.exports = {
    Query : {
        async getPosts(){
            try {
                const posts = await Post.find().sort({createdAt: -1});
                // console.log(posts, 'hello');
                return posts;
            } catch (err){
                throw new Error (err); 
            }
        },
        async getPost(_ , { postId }){
            try {
                const post = await Post.findById(postId);
                if (post){
                    return post
                } else {
                    throw new Error('Post not found');
                }
            } catch(err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createPost(_, { body }, context){
            //to check authorization forthe user creating the post
            const user = checkAuth(context);
            console.log(user);
            if(args.body.trim() === ''){
                throw new Error('Post body must not be empty');
            }
            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            });

            const post = await newPost.save();
            //to add pubsub on the new created post \\
            context.pubsub.publish('NEW_POST', {
                newPost: post
            });
            return post;

        },
        async deletePost(_, { postId }, context){
            const user = checkAuth(context);
            try {
                const post = await Post.findById(postId);
                // console.log("here>>>>>>>>>>>> PPPost",Post);
                // console.log("here>>>>>>>>>>>> post",post);
                console.log(user.username,  post.username)
                if(user.username === post.username){
                    await post.delete();
                    return 'Selected Post deleted successfully'
                } else {
                    throw new AuthenticationError('Action not allowed');
                }
            } catch(err){
                throw new Error(err);
            }
        },
        async likePost(_, { postId }, context){
            const { username } = checkAuth(context);
            
            const post = await Post.findById(postId);
            if(post){
                if(post.likes.find(like => like.username === username)){
                    // if above is true meaning its already liked then unlike by \\
                    post.likes = post.likes.filter(like => like.username !== username);
                }else {
                    //if not liked, then like post
                        post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                        })
                    }
                    await post.save();
                    return post;

            } else throw new userInputError('Post not found');
        },
    },
    Subscription: {
        newPost:{
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
        }

    }
}
