const fs = require('fs');
let http = require('http');
const net = require('net');
const path = require('path')
const HTTP_PORT = "8000";
const TCP_PORT = "9000"
//192.168.137.1
//127.0.0.1
const HTTP_IP = '127.0.0.1'
const TCP_IP = '127.0.0.1'
const TIMEOUT = 60000;//tcp客户端超过60秒没发数据判为超时并断开连接
let tcpClient=null;//tcp客户端

// const express = require('express')
// const path = require('path')
// const app = express()

// app.use(express.static(path.join(__dirname, 'public')))

// app.listen(8080, () => {
//   console.log(`App listening at port 8080`)
// })

/* ---------------创建http server，并传入回调函数:----------*/
const httpServer = http.createServer(function (request, response) {
  // 回调函数接收request和response对象,
  // 获得HTTP请求的method和url:
  console.log(request.method + ': ' + request.url);
  //解析路径，将请求的路径地址解析成对象
  let urlObj = path.parse(request.url)
  // console.log(urlObj)

  //
  if(request.url == "/") {
    //访问首页
    // 读取html文件并发送
    response.end(fs.readFileSync('./static/index.html'));
  }

  else if(urlObj.dir == '/static'){
    //设置响应头，告诉浏览器，返回的内容类型
    response.setHeader('content-type',getContentType(urlObj.ext));
    //读取文件给到浏览器
    let rs = fs.createReadStream('./static/' + urlObj.base);
    //将读取的文件给到相应对象
    rs.pipe(response)
  }

  else if(request.url.match(RegExp(/\/temp/))){
    //  let val = JSON.stringify(request.url);
    let val = request.url;
    changeTemp(val);
    response.end('succeed');
  }

  else if(request.url == "/openAir"){
    // 开空调命令
    openAir();
    response.end('succeed');   
  }

  else if(request.url == "/closeAir"){
  // 开灯命令
  closeAir();
  response.end('succeed');
  }

  else if(request.url == "/openLed"){
  // 开空调命令
  openLed();
  response.end('succeed');   
  }
  
  else if(request.url == "/closeLed"){
  // 开灯命令
    closeLed();
    response.end('succeed');
  }
  
  else if(request.url == "/data"){
    // 获取数据
    let data = getData() || "无数据";
    let addr = "无连接";
    if(tcpClient && tcpClient.addr){
      addr = tcpClient.addr
    }
    
    // 将结果转换成字符串再发出去
    let result = JSON.stringify({addr:addr,data:data});
    response.end(result);
   }
   
   else{
      response.writeHead(400);
      response.end();
    }
});

httpServer.listen({port: HTTP_PORT,host: HTTP_IP});
httpServer.on('error', onError);
httpServer.on('listening', onListening);

/*-------------------创建TCP服务器----------------------*/
const tcpServer = net.createServer((socket)=>{
  //connect
  let addr = socket.remoteAddress + ':' + socket.remotePort
  console.log(addr ," connect.")
  socket.addr = addr
  tcpClient = socket
  

  // recieve data
  socket.on("data",data=>{
    let str = addr+" receive: " + data.toString('ascii') + '\n'
    console.log(str)
    socket.lastValue = data.toString('ascii')
  })

  // close
  socket.on('close',()=>{
    console.log(addr,"close")
    tcpClient = null;
  })

  socket.on('error',(err)=>{
    console.log("error",err)
    tcpClient = null;
  })

  socket.setTimeout(TIMEOUT);
	// 超过一定时间 没接收到数据，就主动断开连接。
	socket.on('timeout', () => {
		console.log(socket.id,socket.addr,'socket timeout');
    socket.end();
    tcpClient = null;
	});
})

tcpServer.on("error",(err)=>{
  console.log(err)
  tcpClient = null;
})
// 192.168.137.1
tcpServer.listen({port: TCP_PORT,host: TCP_IP}, () => {
  console.log('demo0.1 tcp server running on', tcpServer.address())
})
/*------------------------------空调------------------------------------- */
//调温度
function changeTemp(val){
  if(tcpClient){
    // tcpClient.write(i,'ascii')
    tcpClient.write(val+"\r\n")
  }else{
    console.log("changeTemp error:not tcpClient")
  }
}
// 开空调
function openAir() {
  // 向TCP客户端发送1
  if(tcpClient){
    tcpClient.write('air1\r\n', 'ascii')
  }
  else{
    console.log("openAir error:not tcpClient.")
  }
}

// 关空调
function closeAir() {
  // 向TCP客户端发送0
  if(tcpClient){
    tcpClient.write('air0\r\n', 'ascii')
  }
  else{
    console.log("closeAir error:not tcpClient.")
  }
}
/*------------------------------开关灯------------------------------------- */
function openLed() {
  // 向TCP客户端发送1
  if(tcpClient){
    tcpClient.write('led1\r\n', 'ascii')
  }
  else{
    console.log("openLed error:not tcpClient.")
  }
}

// 关空调
function closeLed() {
  // 向TCP客户端发送0
  if(tcpClient){
    tcpClient.write('led0\r\n', 'ascii')
  }
  else{
    console.log("closeLed error:not tcpClient.")
  }
}

// 获取数据
function getData() {
  // 获取设备最新数据
  if(tcpClient){
    return tcpClient.lastValue
  }
  else{
    console.log("getData error:not tcpClient.")
  }

}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = httpServer.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('http server Listening on ' + bind);
}

/*--------------------------------
    静态文件访问
----------------------------------*/
function getContentType(extName){
  switch(extName){
    case ".png":
      return "image/png";
    case ".jpg":
      return "image/jpeg";
    case ".css":
      return "text/css;charset=utf-8";
    case ".json":
      return "text/json;charset=utf-8";
    case ".html":
      return "text/html;charset=utf-8";
    case ".js":
      return "text/javascript;charset=utf-8";
        
  }
}