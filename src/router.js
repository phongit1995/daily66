const express = require("express");
const router = express.Router();
const {getCookieCloudflare,loginUserGetCookie,getUserData,transferAccount,findHistoryAgentSend,
    findHistoryAgentReceive,getInfoAccount} = require('./controller');
const moment = require("moment");
require("dotenv").config();
const USER_ARGENT=process.env.USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36";
router.post("/get-cookie-user",async(req,res)=>{
    try {
        const {username,password,otp,proxy} = req.body ;
        const cookieCloudflare = await getCookieCloudflare(proxy);
        console.log(cookieCloudflare);
        console.log(req.body);
        if(username==undefined ||password==undefined || otp==undefined ){
            res.status(400).json({message:"Lỗi Thiếu Data"});
        }
        const result = await loginUserGetCookie(cookieCloudflare,USER_ARGENT,username,password,otp,proxy);
        return res.status(200).json({data:result});
    } catch (error) {
        res.status(400).json({
            error:error.toString()
        })
    }
    
})
router.post("/tranfer-account",async(req,res)=>{
    try {
        const {usernamesend,usernamereceive,amount,reason,proxy}=req.body;
    if(usernamesend==undefined ||usernamereceive==undefined || amount==undefined || reason==undefined ){
        throw "Lỗi Thiếu Data" ;
    }
    const userSend = await getUserData(usernamesend);
    if(!userSend){
        throw "user send do not have data";
    }
    const cookieCloudflare = await getCookieCloudflare(proxy);
    const resultTranfer =  await transferAccount(cookieCloudflare,USER_ARGENT,userSend.cookie,usernamereceive,amount,reason,proxy)
    res.status(200).json({data:resultTranfer});
    } catch (error) {
        res.status(400).json({error:error.toString()});
    }
})
router.post("/find-history-agent-send",async(req,res)=>{
    try {
        const {username,proxy}=req.body;
        if(username==undefined  ){
            throw "Lỗi Thiếu Data" ;
        }
        const userSend = await getUserData(username);
        if(!userSend){
            throw "user send do not have data";
        }
        const timeNow = moment().format("MM/DD/YYYY")
        const cookieCloudflare = await getCookieCloudflare(proxy);
        console.log(cookieCloudflare);
        const resultHistory = await findHistoryAgentSend(cookieCloudflare,USER_ARGENT,userSend.cookie,timeNow,timeNow,proxy);
        res.status(200).json({data:resultHistory});
    } catch (error) {
        res.status(400).json({error:error.toString()});
    }
})
router.post("/find-history-agent-receive",async(req,res)=>{
    try {
        const {username,proxy}=req.body;
        if(username==undefined ){
            throw "Lỗi Thiếu Data" ;
        }
        const userSend = await getUserData(username);
        if(!userSend){
            throw "user send do not have data";
        }
        const cookieCloudflare = await getCookieCloudflare(proxy);
        const timeNow = moment().format("MM/DD/YYYY")
        const resultHistory = await findHistoryAgentReceive(cookieCloudflare,USER_ARGENT,userSend.cookie,timeNow,timeNow,proxy);
        //const resultHistory = await findHistoryAgentReceive('__cfduid=d17850110bd2b097fb29753f8a17859bf1610703359; cf_clearance=ef15af2ef9c38fd1bad56480b4fc04c20459b68c-1610703359-0-150','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',userSend.cookie,fromdate,todate);
        
        res.status(200).json({data:resultHistory});
    } catch (error) {
        res.status(400).json({error:error.toString()});
    }
})
router.post("/user-account",async(req,res)=>{
    try {
        const {username,proxy}=req.body;
        if(username==undefined ){
            throw "Lỗi Thiếu Data" ;
        }
        const userSend = await getUserData(username);
        if(!userSend){
            throw "user send do not have data";
        }
        const cookieCloudflare = await getCookieCloudflare(proxy);
        console.log(cookieCloudflare);
        const resultAccountInfo = await getInfoAccount(cookieCloudflare,USER_ARGENT,userSend.cookie,proxy);
        res.status(200).json({data:resultAccountInfo});
    } catch (error) {
        res.status(400).json({error:error.toString()});
    }
})
module.exports = router ; 