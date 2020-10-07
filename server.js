//引入express框架
var express = require('express');
var app = express();
var bodyParser = require('body-parser');//用于req.body获取值的
app.use(bodyParser.json());

// 创建 application/x-www-form-urlencoded 编码解析
app.use(bodyParser.urlencoded({ extended: false }));

//设置查找静态文件的地方
app.use(express.static('public'));

//设置跨域访问
app.all("*",function(req,res,next){
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin","*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers","content-type");
    //跨域允许的请求方式 
    res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
        res.send(200);  //让options尝试请求快速结束
    else
        next();
})

//所有setter的信息集合
let setters = [];
//setter总数
let totalSetter = 0; 

//前端获取setter信息接口
app.get('/setterInfo', function(req, res){
    let info = {};
    info["totalN"] = totalSetter;
    info["setters"] = setters;
    res.send(JSON.stringify(info));
})

//  POST 请求
//前端传来setter信息接口
app.post('/', function (req, res) {
    //设置setter总数
    totalSetter = req.body[0].totalN;
    //对每个setter：构造描述setter的信息对象
    for(let i = 0;i < totalSetter;i++){
        setter = req.body[i];
        //当setter的宽高值是带单位px的字符串时，去掉单位并转换为浮点数
        if(typeof(setter.width) == "string"){
            let index = setter.width.lastIndexOf("p")
            setter.width =parseFloat(setter.width.substring(0,index));
            index = setter.height.lastIndexOf("p");
            setter.height = parseFloat(setter.height.substring(0,index));
        }
        //构造setter信息对象
        const setterInfo = {
            index : setter.index,
            width: setter.width,
            height: setter.height,
            x: setter.x,
            y: setter.y,
            color: setter.color,
            content: setter.content
        };
    //将setter信息对象放入总信息数组中
    setters[setter.index] = setterInfo;
}
})
 
var server = app.listen(8081, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})