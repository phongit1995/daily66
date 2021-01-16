const express = require("express");
const router = express.Router();
const {getCookieCloudflare,loginUserGetCookie,getUserData,transferAccount,findHistoryAgentSend,
    findHistoryAgentReceive} = require('./controller');
const moment = require("moment");
router.post("/get-cookie-user",async(req,res)=>{
    try {
        const cookieCloudflare = await getCookieCloudflare();
        console.log(cookieCloudflare);
        console.log(req.body);
        const {username,password,otp} = req.body ;
        if(username==undefined ||password==undefined || otp==undefined ){
            res.status(400).json({message:"Lỗi Thiếu Data"});
        }
        const result = await loginUserGetCookie(cookieCloudflare.cookie,cookieCloudflare.userArgent,username,password,otp);
        return res.status(200).json({data:result});
    } catch (error) {
        res.status(400).json({
            error:error.toString()
        })
    }
    
})
router.post("/tranfer-account",async(req,res)=>{
    try {
        const {usernamesend,usernamereceive,amount,reason}=req.body;
    if(usernamesend==undefined ||usernamereceive==undefined || amount==undefined || reason==undefined ){
        throw "Lỗi Thiếu Data" ;
    }
    const userSend = await getUserData(usernamesend);
    if(!userSend){
        throw "user send do not have data";
    }
    const cookieCloudflare = await getCookieCloudflare();
    const resultTranfer =  await transferAccount(cookieCloudflare.cookie,cookieCloudflare.userArgent,userSend.cookie,usernamereceive,amount,reason)
    res.status(200).json({data:resultTranfer});
    } catch (error) {
        res.status(400).json({error:error.toString()});
    }
})
router.post("/find-history-agent-send",async(req,res)=>{
    try {
        const {username}=req.body;
        if(username==undefined  ){
            throw "Lỗi Thiếu Data" ;
        }
        const userSend = await getUserData(username);
        if(!userSend){
            throw "user send do not have data";
        }
        const timeNow = moment().format("MM/DD/YYYY")
        const cookieCloudflare = await getCookieCloudflare();
        console.log(cookieCloudflare);
        const resultHistory = await findHistoryAgentSend(cookieCloudflare.cookie,cookieCloudflare.userArgent,userSend.cookie,timeNow,timeNow);
        res.status(200).json({data:resultHistory});
    } catch (error) {
        res.status(400).json({error:error.toString()});
    }
})
router.post("/find-history-agent-receive",async(req,res)=>{
    try {
        const {username}=req.body;
        if(username==undefined ){
            throw "Lỗi Thiếu Data" ;
        }
        const userSend = await getUserData(username);
        if(!userSend){
            throw "user send do not have data";
        }
        const cookieCloudflare = await getCookieCloudflare();
        const timeNow = moment().format("MM/DD/YYYY")
        const resultHistory = await findHistoryAgentReceive(cookieCloudflare.cookie,cookieCloudflare.userArgent,userSend.cookie,timeNow,timeNow);
        //const resultHistory = await findHistoryAgentReceive('__cfduid=d17850110bd2b097fb29753f8a17859bf1610703359; cf_clearance=ef15af2ef9c38fd1bad56480b4fc04c20459b68c-1610703359-0-150','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',userSend.cookie,fromdate,todate);
        
        res.status(200).json({data:resultHistory});
    } catch (error) {
        res.status(400).json({error:error.toString()});
    }
})
module.exports = router ; 