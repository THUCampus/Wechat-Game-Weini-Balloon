'use strict';

const Koa = require('koa');
const request = require('request');
const koaBody = require('koa-body');
const http = require('http');
const https = require('https');
const fs = require('fs');
const enforceHttps =  require('koa-sslify');
const crypto = require('crypto');
const sql = require('mysql');

const options={
    key: fs.readFileSync('./ssl/domain.key'),
    cert: fs.readFileSync('./ssl/chained.pem')
};

const connection = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'XNCSDFU2',
    database: 'ubuntu'
});

const app = new Koa();
app.use(koaBody({multipart: true}));
app.use(enforceHttps());

let users = new Object();

app.use(async (ctx,next) =>{
	ctx.status = 200;
	await next();
});

//
app.use(async (ctx,next) => {
    if(ctx.status === 200){
        if(ctx.request.path === "/api/compute"){
            let result = 0;
            let param = ctx.request.query;
            console.log(param);
            switch(ctx.request.query.type){
                case 'ADD':
                result = parseInt(param.firstParam) + parseInt(param.secondParam);
                break;
                case 'SUB':
                result = param.firstParam - param.secondParam;
                break;
                case 'MUL':
                result = param.firstParam * param.secondParam;
                break;
                case 'DIV':
                result = Math.round(param.firstParam / param.secondParam);
                break;
                default:break;
            }
            ctx.response.status = 200;
            ctx.response.type = 'application/json';
            ctx.response.body = {
                ans: result
            };
        }
        else{
            await next();
        }
    }
});

app.use(async (ctx,next) => {
    if(ctx.request.path === '/api/addMoney'){
        let secret = ctx.request.query.secret;
        let sql = `SELECT * FROM users WHERE secret=?`;
        let score = parseFloat(ctx.request.query.score);
        connection.query(sql,secret,(err,results,fields) =>{
            if(err){
                console.log(err);
            }
            if(score <= results[0].biggest_ballon){
                score = results[0].biggest_ballon;
            }
        });
        sql = `UPDATE users SET biggest_ballon = ?, money = ? WHERE secret = ?`;
        connection.query(sql,[score,ctx.request.query.money,secret],
            (err,results,fields) =>{
                if(err){
                    console.log(err);
                }
        });
        ctx.response.status = 200;
    }else{
        await next();
    }
});

app.use(async (ctx,next) => {
    if(ctx.request.path === '/api/buy'){
        let secret = ctx.request.query.secret;
        let body = await buyUp(secret);
	console.log(body);
        ctx.response.body = body;
        ctx.response.status = 200;
    }else{
        await next();
    }
});

app.use(async (ctx,next) =>{
    if(ctx.request.path === '/onLogin'){
        let data = await reqUserInfo(ctx.request.query.code);
        let body = await getUserInfoFromDb(data);
        ctx.response.status = 200;
        ctx.response.body = body;
    }else{
        await next();
    }
});

http.createServer(app.callback()).listen(80);
https.createServer(options, app.callback()).listen(443);

function reqUserInfo(code){
    return new Promise(function (resolve,reject){
        request.get({
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            json: true,
            qs: {
		appid: 'wx58d7d25951529608',
		secret: '7c1711a69fd8e2fa2fdd341f8cc84e5a',
                js_code: code,
                grant_type: 'authorization_code'
            }
        },function(err,res,data){
            if(res.statusCode === 200){
                resolve(data);
            }else{
                reject(err);
            }
        });
    });
}

function getUserInfoFromDb(data){
    return new Promise((resolve,reject) => {
        let user_secret = crypto.createHmac('sha256',data.session_key).update(data.openid).digest('base64');
        let sql = `SELECT * FROM users WHERE openId=?`;
        let body = {
            secret: user_secret
        };
        connection.query(sql, data.openid,(err,results,fields) =>{
            if(err){
                console.log('login');
                console.error(err.message);
                reject(err);
            }
            //判断是否存在用户
            if(results.length === 0){
                sql = `INSERT INTO users SET ?`;
                let newuser = {
                    openId: data.openid,
                    session_key: data.session_key,
                    secret: user_secret,
                    biggest_ballon: 0,
                    money: 0
                };
                connection.query(sql,newuser,(err,results,fields) =>{
                    if(err){
                        console.log('new user');
                        console.error(err.message);
                    }
                });
                body.biggest_balloon = 0;
                body.money = 0;
            }else{
                sql = `UPDATE users SET session_key = ?, secret = ? WHERE openId = ?`;
                connection.query(sql,[data.session_key,user_secret,data.openid],
                    (err,results,fields)=>{
                        if(err){
                            console.log(err.message);
                        }
                });
                body.biggest_balloon = results[0].biggest_ballon;
                body.money = results[0].money;
            }
            resolve(body);
        });
    });
}

function buyUp(secret){
    return new Promise((resolve,reject) => {
        let sql = `SELECT * FROM users WHERE secret=?`;
        let body = {
            purchase: 'failed'
        };
        connection.query(sql,secret,(err,results,fields) =>{
            if(err){
                console.log('buy');
                console.log(err);
                reject(err);
            }
            if(results[0].money >= 50){
		body.purchase = 'succeed';
                let money = results[0].money - 50;
                sql = `UPDATE users SET money = ? WHERE secret = ?`;
                connection.query(sql,[money,secret],(err,results,fields) =>{
                    if(err){
                        console.log(err);
                    }
                });
            }
            resolve(body);
        });
    });
}
