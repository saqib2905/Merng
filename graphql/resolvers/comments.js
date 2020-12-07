const { userInputError, AuthenticationError } = require('apollo-server');
const Post = require('../../models/Post');
const checkAuth = require('../../utils/check-auth');

module.exports = {
    Mutation : {
        createComment: async (_, { postId, body }, context) => {
            const { username } = checkAuth(context);
            //if user try to create an empty comment\\
            if(body.trim === ''){
                throw new userInputError('Empty Comment',{
                    errors: {
                        body: 'comment body must not be empty'
                    }
                })
            }
            const post = await Post.findById(postId);
            if (post){
                post.comments.unshift({
                    body,
                    username,
                    createdAt: new Date().toISOString()
                })
                await post.save();
                return post;
            } else throw new userInputError('Post not found');
        },
        deleteComment : async(_,{commentId, postId}, context) => {
            const {username} = checkAuth(context);  
            const post = await Post.findById(postId);
            if(post){
                //get the index of the comment ater checking its id is the same we trying to delete\\
                const commentIndex = post.comments.findIndex(comm => comm.id === commentId);
                if(post.comments[commentIndex].username === username){
                    post.comments.splice(commentIndex,1);
                    await post.save();
                    return post;
                } else {
                    throw new AuthenticationError('Action not allowed');
                }
            } else throw new userInputError('post not found');         
        }
    }
}