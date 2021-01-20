const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const proxyChain = require('proxy-chain');
const cloudflareScraper = require('cloudflare-scraper');
const  { isCloudflareJSChallenge} = require('./common');
const userModel = require("./user.model");
const cacheMemory = require('memory-cache');
const request = require('request-promise');
const md5 = require('md5');
require("dotenv").config();
const USER_ARGENT=process.env.USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36";
puppeteer.use(StealthPlugin());
// const getCookieCloudflare = async()=>{
//     const KEY_CACHE="KEY_CACHE";
//     const dataCache = cacheMemory.get(KEY_CACHE);
//     if(dataCache){
//         console.log('co cache');
//         return dataCache;
//     }
//     const response = await cloudflareScraper.get('http://daily66.club/',{resolveWithFullResponse:true,
//     //proxy:"http://trungduc:trungduc2022@103.153.72.151:22225"
//     });
//     const data = {
//         cookie:response.request.headers['cookie'],
//         userArgent:response.request.headers['User-Agent']
//     }
//     cacheMemory.put(KEY_CACHE,data,1000*60*30);
//     return data ;
// }
const getCookieCloudflare=async(proxy)=>{
    const KEY_CACHE="KEY_CACHE"+proxy;
    const dataCache = cacheMemory.get(KEY_CACHE);
    if(dataCache){
        console.log('co cache');
        return dataCache;
    }
    let newProxyUrl ,  browser;
    if(proxy){
        newProxyUrl = await proxyChain.anonymizeProxy(proxy);
        browser = await puppeteer.launch({
            args : ['--no-sandbox', '--disable-setuid-sandbox',`--proxy-server=${newProxyUrl}`]
        });
    }else {
        browser = await puppeteer.launch({
            args : ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    
    const page = await browser.newPage();
    await page.setUserAgent(USER_ARGENT);
    await page.authenticate();
    await page.goto("https://daily66.club/",{
        timeout:45000,
        waitUntil: 'domcontentloaded'
    })
    
    let count = 1;
    let content = await page.content();
    while(isCloudflareJSChallenge(content)){
        response = await page.waitForNavigation({
            timeout: 50000,
            waitUntil: 'domcontentloaded'
        });
        content = await page.content();
        if (count++ === 10) {
          throw new Error('timeout on just a moment');
        }
    }
    const cookies = await page.cookies();
    let result ="";
    for(let cookie of cookies){
        result+= `${cookie.name}=${cookie.value};` ;
    }
    if(newProxyUrl){
        await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
    }
    await browser.close();
    cacheMemory.put(KEY_CACHE,result,1000*60*30);
    return result ;

}
const loginUserGetCookie=async(cookie, userArgent,username,password,otp,proxy)=>{
    const options ={
        method:"post",
        url:"https://daily66.club/api/Authen/login",
        headers:{
            'User-Agent':userArgent,
            cookie:cookie,
            'Content-Type': 'application/json'
        },
        proxy:proxy,
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
        const cookieLogin = resultData.headers['set-cookie'].join(";") ;
        const data = resultData.body ;
        createUser(username,password,cookieLogin,data);
        return JSON.parse(data) ;
    } catch (error) {
        console.log("Lỗi");
        //console.log(error);
        throw error.message ;
    }
}
const createUser = async(username,password,cookie,data)=>{
    const user = await userModel.findOne({username:username});
    if(user){
        user.password= password ;
        user.cookie = cookie;
        user.data = data;
        await user.save();
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
const transferAccount = async(cookieCl,userArgent,cookieUser,userReceive,amount,reason,proxy)=>{
    const options={
        method:"post",
        url:"https://daily66.club/api/Payment/TranferAccount",
        headers:{
            'User-Agent':userArgent,
            cookie:cookieCl+";"+cookieUser,
            'Content-Type': 'application/json'
        },
        proxy:proxy,
        body:JSON.stringify({
            userName:userReceive,
            amount:amount,
            reason:reason
        })
    }
    const resultTranfer = await request(options);
    return resultTranfer ;
}
const findHistoryAgentSend =async(cookieCl,userArgent,cookieUser,fromDate,toDate,proxy)=>{
    const options={
        method:"post",
        url:"https://daily66.club/api/Agency/FindHistoryAgent",
        headers:{
            'User-Agent':userArgent,
            cookie:cookieCl+";"+cookieUser,
            'Content-Type': 'application/json'
        },
        proxy:proxy,
        body:JSON.stringify({
            Fromdate:fromDate,
            Todate:toDate,
            Type:2,
            Typeserch:1
        })
    }
    const resultHistoryAgent = await request(options);
    return JSON.parse( resultHistoryAgent );
}
const findHistoryAgentReceive =async(cookieCl,userArgent,cookieUser,fromDate,toDate,proxy)=>{
    const options={
        method:"post",
        url:"https://daily66.club/api/Agency/FindHistoryAgent",
        headers:{
            'User-Agent':userArgent,
            cookie:cookieCl+";"+cookieUser,
            'Content-Type': 'application/json'
        },
        proxy:proxy,
        body:JSON.stringify({
            Fromdate:fromDate,
            Todate:toDate,
            Type:1,
            Typeserch:1
        })
    }
    const resultHistoryAgent = await request(options);
    return JSON.parse( resultHistoryAgent );
}
const getInfoAccount = async(cookieCl,userArgent,cookieUser,proxy)=>{
    const options={
        method:"get",
        url:"https://daily66.club/api/Authen/GetAccountInfo",
        headers:{
            'User-Agent':userArgent,
            cookie:cookieCl+cookieUser,
            'Content-Type': 'application/json'
        },
        proxy:proxy
    }
    console.log(options);
    const resultInfo = await request(options);
    console.log(resultInfo);
    return JSON.parse( resultInfo );
}
module.exports ={
    loginUserGetCookie,
    getCookieCloudflare,
    getUserData,
    transferAccount,
    findHistoryAgentSend,
    findHistoryAgentReceive,
    getInfoAccount
}