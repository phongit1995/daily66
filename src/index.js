const express = require("express");
require("dotenv").config();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cors  = require('cors');
const router = require('./router');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true,useUnifiedTopology: true ,useCreateIndex: true,useFindAndModify:false},(error)=>{
    if(error){
        console.log(error);
        console.log('Thất Bại');
    }else {
        console.log('Connect successed to mongo');
    }
});
app.use("/",router);
app.listen(PORT,()=>{
    console.log(`Server Running On Port : ${PORT}`);
})