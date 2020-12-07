const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {UserInputError} = require('apollo-server');

const {validateRegisterInput,validateLoginInput} = require('../../utils/validators');
const {SECRET_KEY} = require('../../config');
const User = require('../../models/User');

const generateToken = (user) => {
   return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, {expiresIn : '1h'});
}

module.exports = {
    Mutation : {
        async login(_,{username,password}){
            const {errors,valid} = validateLoginInput(username, password);
            if(!valid){
                throw new UserInputError('Errors', {errors})
            }
            const user = await User.findOne({username});
            if(!user){
                throw new UserInputError('user not found', {errors});
            }
            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = 'wrong credentials'
                throw new UserInputError('wrong credentials');
            }
            const token = generateToken(user);
            return {
                ...user._doc,
                id: user._id,
                token

            }
        },
        async register(_, {registerInput: {username, email, password, confirmPassword}}, context, info){
            // validate user data
            const {errors, valid} = validateRegisterInput(username, email, password, confirmPassword)
            if(!valid){
                throw new UserInputError('Errors', {errors})
            }
            // makesure user doesnt already exists \\
            const user = await User.findOne({username})
            if (user){
                throw new UserInputError('username is taken', {
                    errors: {
                        username: 'this username is taken'
                    }
                })
            }
            // hash the password create an auth token \\
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                username,
                password,
                email,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res)

            // console.log(res);
            return {
                ...res._doc,
                id: res._id,
                token

            }
        }
    }
}