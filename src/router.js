const express = require("express");
const router = express.Router();
const {getCookieCloudflare,loginUserGetCookie,getUserData,transferAccount} = require('./controller');
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
        return res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message:error.toString()
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
    // await transferAccount('__cfduid=d0f63532a90e7799190d1b61bd3df7e641610700859; cf_clearance=39eea0ae9fc47e3da443d2099b2cee6e6ba20578-1610700858-0-150; cf_chl_prog=a15',
    // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
    //     userSend.cookie,usernamereceive,amount,reason);
    res.status(200).json({message:resultTranfer});
    } catch (error) {
        res.status(400).json({message:error.toString()});
    }
})
module.exports = router ; 