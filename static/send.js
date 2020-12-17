
// 	window.onload = function(){
//   var lbl7=document.getElementById("Label1").dataset; //获取label里的dao值
//   console.log(lbl7);
/*----------------------------改变温度------------------------------*/
function ctlAir(state) {
    let oReq = new XMLHttpRequest();

    state.getAttribute("data-label") == "on" 
    ? state.setAttribute("data-label","off")
    : state.setAttribute("data-label","on");
    let stateType = state.getAttribute("data-label")

    // alert(animal.innerHTML + "是一种" + animalType + "。");
    if(stateType == "on"){
        oReq.open("GET", "/openAir");
        oReq.send();
    }else if(stateType == "off"){
        oReq.open("GET", "/closeAir");
        oReq.send();  
    }
    console.log(stateType)
}

function plus(){
    let val = parseFloat(document.getElementById("tempData").textContent);  
    if(document.getElementById("Label1").getAttribute("data-label") == "on"){
        if(val < 30)
        {
            val ++;
        }else {
            val = 30;  
        }
        document.getElementById("tempData").textContent = val + '°C'
    
        let oReq = new XMLHttpRequest();
        oReq.open("GET", "/temp"+ val);
        // oReq.open("GET", "/temp");
        oReq.send();
    }

}

function minus(){
    let val = parseFloat(document.getElementById("tempData").textContent);  
    if(document.getElementById("Label1").getAttribute("data-label") == "on"){
        if(val > 16)
        {
            val --;
        }else {
            val = 16;  
        }
        document.getElementById("tempData").textContent = val + '°C'

        let oReq = new XMLHttpRequest();
        oReq.open("GET", "/temp"+ val);
        // oReq.open("GET", "/temp");
        oReq.send();
    }

}
//
function temp(){
    let val = document.getElementById("temp").value;
    let oReq = new XMLHttpRequest();
    oReq.open("GET", "/temp"+ val);
    // oReq.open("GET", "/temp");
    oReq.send();
}


/*----------------------------开关灯------------------------------*/
        // 开空调函数，发起请求 GET /open
// function openLed() {
//     let oReq = new XMLHttpRequest();
//     oReq.open("GET", "/openLed");
//     oReq.send();ir
// }

// // 关空调函数，发起请求 GET /close
// function closeLed() {
//     let oReq = new XMLHttpRequest();
//     oReq.open("GET", "/closeLed");
//     oReq.send();
// }
function ctlLed(state) {
    let oReq = new XMLHttpRequest();

    state.getAttribute("data-label") == "on" 
    ? state.setAttribute("data-label","off")
    : state.setAttribute("data-label","on");
    let stateType = state.getAttribute("data-label")

    // alert(animal.innerHTML + "是一种" + animalType + "。");
    if(stateType == "on"){
        oReq.open("GET", "/openLed");
        oReq.send();
    }else if(stateType == "off"){
        oReq.open("GET", "/closeLed");
        oReq.send();  
    }
    console.log(stateType)
}
/*--------------------------
    显示湿度
---------------------*/


// 为按钮添加事件
// document.getElementById("ctlAir").addEventListener("click",ctlAir)
document.getElementById("minus").addEventListener("click",minus)
document.getElementById("plus").addEventListener("click",plus)
// document.getElementById("submit").addEventListener("click",temp)
// document.getElementById("openLed").addEventListener("click",openLed)
// document.getElementById("closeLed").addEventListener("click",closeLed)

/*---------------------------------------------------*/
// 获取数据函数，发起请求 GET /data
function getData() {
    //1.创建ajax对象
    let oReq = new XMLHttpRequest();
    //2.设置请求方式和请求地址
    oReq.open("GET", "/data");
    //3.发送请求
    oReq.send();
    // 4.接收返回的数据
    oReq.onload = function callback() {
        let result = oReq.response;
        let obj = JSON.parse(result);
        document.getElementById("equipment-addr").textContent = obj.addr
        document.getElementById("equipment-data").textContent = obj.data
        //读取湿度
        if(obj.data.match(RegExp(/humidity_data:/))){
            let data = parseFloat(obj.data) + '%';
            console.log(data)
            let bottom = 'bottom: ' + data;
            let height = 'height: ' + data;
            //DOM操作，把数据渲染到网页上
            document.getElementById("total").textContent = data;
            document.getElementById("total").setAttribute("style",bottom);
            document.getElementById("amount").setAttribute("style",height);
        }
        //读取温度
        if(obj.data.match(RegExp(/temperature_data:/))){
            let data = parseFloat(obj.data) + '°C';
            let data1 = parseFloat(obj.data) + '%';
            console.log(data)
            let bottom = 'bottom: ' + data1;
            let height = 'height: ' + data1;
            //DOM操作，把数据渲染到网页上
            document.getElementById("temp_total").textContent = data;
            document.getElementById("temp_total").setAttribute("style",bottom);
            document.getElementById("temp_amount").setAttribute("style",height);
        }
    }
}

//HTTP 轮询：每一秒拿一次数据。
setInterval(getData,2000)