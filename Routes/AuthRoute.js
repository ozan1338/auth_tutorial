const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const User = require('../models/UserModel');
const {authSchema} = require('../helpers/validationSchema');
const {signAccessToken, signRefreshTokeen} = require('../helpers/jwthelper')

router.post('/register', async(req,res,next)=>{
    //console.log(req.body);
    try{
        //const {email , password} = req.body
        // if(!email || !password){
        //     throw createError.BadRequest()
        // }

        const result = await authSchema.validateAsync(req.body);

        const doesExist = await User.findOne({email: result.email})
        if(doesExist) {
            throw createError.Conflict(`${result.email} is already been register`)
        }

        const user = new User(result);
        const saveUser = await user.save();
        const AccessToken = await signAccessToken(saveUser.id);
        const refreshToken = await signRefreshTokeen(saveUser.id)
        res.send({AccessToken,refreshToken})
        


    }catch(err){
        if(err.isJoi === true){
            err.status = 422
        }
        next(err)
    }
});

router.post('/login', async(req,res,next)=>{
    try{
        const result = await authSchema.validateAsync(req.body);
        const user = await User.findOne({email: result.email});

        const isMatch = await user.isValidPassword(result.password)
        if (!isMatch){
            throw createError.Unauthorized('UserName or Password not valid')
        }
        

        if(!user){
            throw createError.NotFound("User Not Registered")
        }

        const accessToken = await signAccessToken(user.id)
        const refreshToken = await signRefreshTokeen(user.id)

        res.send({accessToken,refreshToken})
        
    }catch(err){
        if(err.isJoi === true){
            return next(createError.BadRequest("Invalid Username or Password"))
        }
        next(err)
    }
});

router.post('/refresh-token', async(req,res,next)=>{
    try{
        const {refreshToken} = req.body

        if(!refreshToken){
            throw createError.BadRequest()
        }

        const userId = await verifyRefreshToken(refreshToken)

        const accessToken = await signAccessToken(userId)
        const refToken = await signRefreshTokeen(userId)

        res.send({accessToken, refToken})

    }catch(err){
        next(err)
    }
});

router.delete('/logout', async(req,res)=>{
    res.send("logout route")
})


module.exports = router