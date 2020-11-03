
//引入express框架
var express = require('express');
var app = express();
var bodyParser = require('body-parser');//用于req.body获取值的
//处理文件上传
var multiparty = require('multiparty');
let fs = require('fs');
let path = require('path');
app.use(bodyParser.json());

// 创建 application/x-www-form-urlencoded 编码解析
app.use(bodyParser.urlencoded({ extended: false }));

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

//设置查找静态文件的地方
app.use(express.static('static'));



/** * 使用express来实现对于静态资源的控制。 */
/*
let express = require('express');
let fs = require('fs');
let path = require('path');
var app = express();
console.log("server running...")
app.use(express.static(path.join(__dirname, './public')));


app.get('/public', function(req, res){    
    console.log("=======================================");    
    console.log("请求路径："+req.url);    
    var filename = req.url.split('/')[req.url.split('/').length-1];    
    var suffix = req.url.split('.')[req.url.split('.').length-1];   
    console.log("文件名：", filename);    
    if(req.url==='/'){        
        res.writeHead(200, {'Content-Type': 'text/html'});        
        res.end(get_file_content(path.join(__dirname, 'html', 'index.html')));    
    }else if(suffix==='css'){        
        res.writeHead(200, {'Content-Type': 'text/css'});        
        res.end(get_file_content(path.join(__dirname, 'public', 'css', filename)));    
    }else if(suffix in ['gif', 'jpeg', 'jpg', 'png']) {        
        res.writeHead(200, {'Content-Type': 'image/'+suffix});        
        res.end(get_file_content(path.join(__dirname, 'public', filename)));    
    }});
    function get_file_content(filepath){    
        return fs.readFileSync(filepath);
    }
    app.listen(8080, function(){
        console.log("listening on 8080...")
    });

app.get('/', function(req, res){
    console.log("get hello world!")
    res.send('Hello World');
})

app.get('/test', function(req, res){
    console.log("get test!!!");
    res.send(JSON.stringify({hello : "hello world"}));
})
*/

/*
app.get('/a.jpg', function(req, res){
    console.log("get a.jpg!!!");
    res.writeHead(200, {'Content-Type': 'image/jpg'});        
    res.end(get_file_content(path.join(__dirname, 'public','image', 'a.jpg'))); 
})

app.get('/iFound.mp4', function(req, res){
    console.log("get iFound.mp4!!!");
    var file = path.resolve(__dirname, 'public', 'video', "iFound.mp4");
    fs.stat(file, function(err, stats) {
        if (err) {
          if (err.code === 'ENOENT') {
            // 404 Error if file not found
            return res.sendStatus(404);
          }
        res.end(err);
    }
    var range = req.headers.range;
    if (!range) {
        // 416 Wrong range
        return res.sendStatus(416);
    }
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);
    var total = stats.size;
    var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    var chunksize = (end - start) + 1;
    res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        'Content-Type': 'video/mp4',
        "Content-Length": chunksize,
        "Accept-Ranges": "bytes",
    });        
    var stream = fs.createReadStream(file, { start: start, end: end })
    .on("open", function() {
      stream.pipe(res);
    }).on("error", function(err) {
      res.end(err);
    });
});
    //res.end(get_file_content(path.join(__dirname, 'public', 'a.jpg'))); 
})
*/

app.post('/public/image', function(req, res){
    console.log("img uploaded!!!");
    var form = new multiparty.Form({uploadDir: './public/image/'});
    form.parse(req, function(err, fields, files) {
        var inputFile = files.file[0];
        var uploadedPath = inputFile.path;
        var dstPath = './public/image/' + inputFile.originalFilename;
        //重命名为真实文件名
        fs.rename(uploadedPath, dstPath, function (err) {
            if (err) {
                console.log('rename error: ' + err);
                res.send(JSON.stringify({"fileName" : null}))
            } else {
                console.log('rename ok');
                //将文件路径存入数据库
                //将文件路径返回前端
                res.send(JSON.stringify({"fileName" : inputFile.originalFilename}))
            }
        });
        //res.send('upload success');
    });
})

app.post('/public/video', function(req, res){
    console.log("vid uploaded!!!");
    var form = new multiparty.Form({uploadDir: './public/video/'});
    form.parse(req, function(err, fields, files) {
        var inputFile = files.file[0];
        var uploadedPath = inputFile.path;
        var dstPath = './public/video/' + inputFile.originalFilename;
        //重命名为真实文件名
        fs.rename(uploadedPath, dstPath, function (err) {
            if (err) {
                console.log('rename error: ' + err);
                res.send(JSON.stringify({"fileName" : null}))
            } else {
                console.log('rename ok');
                //将文件路径存入数据库
                //将文件路径返回前端
                res.send(JSON.stringify({"fileName" : inputFile.originalFilename}))
            }
        });
        //res.send('upload success');
    });
})

app.get('/public/image/*', function(req, res){
    const filename = req.url.split('/')[req.url.split('/').length-1];    
    const suffix = req.url.split('.')[req.url.split('.').length-1];   
    console.log("返回图片！！！")     
    res.writeHead(200, {'Content-Type': 'image/'+suffix});        
    res.end(get_file_content(path.join(__dirname, 'public', 'image', filename))); 
})

app.get('/public/video/*', function(req, res){
    const filename = req.url.split('/')[req.url.split('/').length-1];    
    const suffix = req.url.split('.')[req.url.split('.').length-1];   
    console.log("返回视频！！！");
        var file = path.resolve(__dirname,'public', 'video',  filename);
        fs.stat(file, function(err, stats) {
            if (err) {
            if (err.code === 'ENOENT') {
                // 404 Error if file not found
                return res.sendStatus(404);
            }
            res.end(err);
        }
        var range = req.headers.range;
        if (!range) {
            // 416 Wrong range
            return res.sendStatus(416);
        }
        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);
        var total = stats.size;
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = (end - start) + 1;
        res.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + total,
            'Content-Type': 'video/mp4',
            "Content-Length": chunksize,
            "Accept-Ranges": "bytes",
        });        
        var stream = fs.createReadStream(file, { start: start, end: end })
        .on("open", function() {
        stream.pipe(res);
        }).on("error", function(err) {
        res.end(err);
        });
})
});

/*
app.get('/public/*', function(req, res){
    console.log("=======================================");    
    console.log("请求路径："+req.url);    
    var filename = req.url.split('/')[req.url.split('/').length-1];    
    var suffix = req.url.split('.')[req.url.split('.').length-1];   
    console.log("文件名：", filename);   
    console.log("后缀名：" , suffix + "后缀名类型：" + typeof(suffix));
    if(req.url==='/'){ 
        console.log("返回文字html！！！")       
        res.writeHead(200, {'Content-Type': 'text/html'});        
        res.end(get_file_content(path.join(__dirname, 'html', 'index.html')));    
    }else if(suffix==='css'){
        console.log("返回css！！！")        
        res.writeHead(200, {'Content-Type': 'text/css'});        
        res.end(get_file_content(path.join(__dirname, 'public', 'css', filename)));    
    }
    else if(suffix === 'gif' || suffix === 'jpeg' || suffix === 'jpg' || suffix === 'png') {   
        console.log("返回图片！！！")     
        res.writeHead(200, {'Content-Type': 'image/'+suffix});        
        res.end(get_file_content(path.join(__dirname, 'public', 'image', filename))); 
    }else if(suffix==='mp4'){
        console.log("返回视频！！！");
        var file = path.resolve(__dirname,'public', 'video',  filename);
        fs.stat(file, function(err, stats) {
            if (err) {
            if (err.code === 'ENOENT') {
                // 404 Error if file not found
                return res.sendStatus(404);
            }
            res.end(err);
        }
        var range = req.headers.range;
        if (!range) {
            // 416 Wrong range
            return res.sendStatus(416);
        }
        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);
        var total = stats.size;
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = (end - start) + 1;
        res.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + total,
            'Content-Type': 'video/mp4',
            "Content-Length": chunksize,
            "Accept-Ranges": "bytes",
        });        
        var stream = fs.createReadStream(file, { start: start, end: end })
        .on("open", function() {
        stream.pipe(res);
        }).on("error", function(err) {
        res.end(err);
        });
    });
    }else{
        console.log("啥也不返回！！！");
    }
})
*/

function get_file_content(filepath){    
    return fs.readFileSync(filepath);
}


/**
 * /** * \\\使用express来实现对于静态资源的控制。 
 let express = require('express');
 let fs = require('fs');
 let path = require('path');
 var app = express();
 app.use(express.static(path.join(__dirname, './public')));
 
 app.get('/public/*', function(req, res){    
     console.log("=======================================");    
     console.log("请求路径："+req.url);    
     var filename = req.url.split('/')[req.url.split('/').length-1];    
     var suffix = req.url.split('.')[req.url.split('.').length-1];    
     console.log("文件名：", filename);    
     if(req.url==='/'){        
         res.writeHead(200, {'Content-Type': 'text/html'});        
         res.end(get_file_content(path.join(__dirname, 'html', 'index.html')));    
    }else if(suffix==='css'){        
        res.writeHead(200, {'Content-Type': 'text/css'});        
        res.end(get_file_content(path.join(__dirname, 'public', 'css', filename)));    
    }else if(suffix === 'gif' || suffix === 'jpeg' || suffix === 'jpg' || suffix === 'png') {        
        res.writeHead(200, {'Content-Type': 'image/'+suffix});        
        res.end(get_file_content(path.join(__dirname, 'public', filename)));    
    }});
    function get_file_content(filepath){    
        return fs.readFileSync(filepath);
    }


/*

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
 */
var server = app.listen(8081, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})
