const express = require('express');
const morgan = require('morgan');
const createError = require('http-errors');
require('dotenv').config();
require('./helpers/initMongoDb');
const {verifyAccessToken} =  require('./helpers/jwthelper')

const AuthRoute = require('./Routes/AuthRoute');

const app = express();
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const PORT = process.env.PORT || 5000;


app.get("/", verifyAccessToken ,async(req,res,next)=>{
    
    res.send("Hello from express")
})

app.use('/auth', AuthRoute)


app.use(async(req,res,next)=>{
    // const error = new Error("Not Found");
    // error.status = 404;
    // next(error)
    next(createError.NotFound())
});

app.use((err,req,res,next)=>{
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})





app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
})