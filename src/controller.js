const cloudflareScraper = require('cloudflare-scraper');
const userModel = require("./user.model");
const cacheMemory = require('memory-cache');
const request = require('request-promise');
const md5 = require('md5');
const getCookieCloudflare = async()=>{
    const KEY_CACHE="KEY_CACHE";
    const dataCache = cacheMemory.get(KEY_CACHE);
    if(dataCache){
        console.log('co cache');
        return dataCache;
    }
    const response = await cloudflareScraper.get('http://daily66.club/',{resolveWithFullResponse:true});
    const data = {
        cookie:response.request.headers['cookie'],
        userArgent:response.request.headers['User-Agent']
    }
    cacheMemory.put(KEY_CACHE,data,1000*60*30);
    return data ;
}
const loginUserGetCookie=async(cookie, userArgent,username,password,otp)=>{
    const options ={
        method:"post",
        url:"https://daily66.club/api/Authen/login",
        headers:{
            'User-Agent':userArgent,
            cookie:cookie,
            'Content-Type': 'application/json'
        },
        resolveWithFullResponse:true,
        body:JSON.stringify({
            username:username,
            password:password,
            passwordMD5:md5(password),
            otp:otp,
            OtpType:1
        })
    }
    try {
        const resultData = await request(options);
        //console.log(resultData.headers['set-cookie'].join(";"));
        const cookieLogin = resultData.headers['set-cookie'].join(";") ;
        const data = resultData.body ;
        createUser(username,password,cookieLogin,data);
        return JSON.parse(data) ;
    } catch (error) {
        console.log("Lỗi");
        throw error.message ;
    }
}
const createUser = async(username,password,cookie,data)=>{
    const user = await userModel.findOne({username:username});
    if(user){
        user.password= password ;
        user.cookie = cookie;
        user.data = data;
    }
    else {
        return userModel.create({
            username:username,
            password:password,
            cookie:cookie,
            data:data
        })
    }
}
const getUserData=(username)=>{
    return userModel.findOne({username:username});
}
const transferAccount = async(cookieCl,userArgent,cookieUser,userReceive,amount,reason)=>{
    const options={
        method:"post",
        url:"https://daily66.club/api/Payment/TranferAccount",
        headers:{
            'User-Agent':userArgent,
            cookie:cookieCl+";"+cookieUser,
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            userName:userReceive,
            amount:amount,
            reason:reason
        })
    }
    const resultTranfer = await request(options);
    return resultTranfer ;
}
const findHistoryAgent =async(cookieCl,userArgent,cookieUser,fromDate,toDate)=>{
    const options={
        method:"post",
        url:"https://daily66.club/api/Agency/FindHistoryAgent",
        headers:{
            'User-Agent':userArgent,
            cookie:cookieCl+";"+cookieUser,
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            Fromdate:"01/15/2021",
            Todate:"01/15/2021",
            Type:2,
            Typeserch:1
        })
    }
    const resultHistoryAgent = await request(options);
    return JSON.parse( resultHistoryAgent );
}
module.exports ={
    loginUserGetCookie,
    getCookieCloudflare,
    getUserData,
    transferAccount,
    findHistoryAgent
}