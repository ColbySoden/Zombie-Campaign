//(function(){
    var socket = io.connect('http://ec2-18-188-12-58.us-east-2.compute.amazonaws.com:80/');

    socket.on("startup", (data) => {
        console.log('startup received');
        var moves = [];
        moves = data.prevMoves;
        for(var i=0; i < moves.length; i++){
            if(moves[i][0] == 'color'){
                x = moves[i][1];
                y = moves[i][2];
            }else{
                //TODO
                /*var newE = {clientX : moves[i][1], clientY : moves[i][2]};
                findxy(moves[i][0], newE);
                */
            }
        }
    })

    socket.on('draw', (data) => {
        console.log('draw received...');
        asyncDraw(data.pX, data.pY, data.cX, data.cY);
    })

    socket.on('clear', (data) => {
        console.log('clear');
        erase();
    })

    socket.on('color', (data) => {
        console.log('color() received');
        x = data.color;
        y = data.yVal;
    })

    var canvas, ctx, flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        dot_flag = false;

    var x = "black",
        y = 2;

    function init() {
        canvas = document.getElementById('can');
        ctx = canvas.getContext("2d");
        w = canvas.width;
        h = canvas.height;

        canvas.addEventListener("mousemove", function (e) {
            findxy('move', e)
        }, false);
        canvas.addEventListener("mousedown", function (e) {
            findxy('down', e)
        }, false);
        canvas.addEventListener("mouseup", function (e) {
            findxy('up', e)
        }, false);
        canvas.addEventListener("mouseout", function (e) {
            findxy('out', e)
        }, false);
    }

    function color(obj) {
        switch (obj.id) {
            case "green":
                x = "green";
                break;
            case "blue":
                x = "blue";
                break;
            case "red":
                x = "red";
                break;
            case "yellow":
                x = "yellow";
                break;
            case "orange":
                x = "orange";
                break;
            case "black":
                x = "black";
                break;
            case "white":
                x = "white";
                break;
        }
        if (x == "white") y = 14;
        else y = 2;

        socket.emit('color', {name : x, yVal : y})

    }

    function draw() {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.strokeStyle = x;
        ctx.lineWidth = y;
        ctx.stroke();
        ctx.closePath();
    }

    function asyncDraw(pX, pY, cX, cY) {
        ctx.beginPath();
        ctx.moveTo(pX, pY);
        ctx.lineTo(cX, cY);
        ctx.strokeStyle = x;
        ctx.lineWidth = y;
        ctx.stroke();
        ctx.closePath();
    }

    function erase() {

        var m = confirm("Want to clear");
        if (m) {
            socket.emit('clear')
            ctx.clearRect(0, 0, w, h);
            document.getElementById("canvasimg").style.display = "none";
        }
    }

    function save() {
        document.getElementById("canvasimg").style.border = "2px solid";
        var dataURL = canvas.toDataURL();
        document.getElementById("canvasimg").src = dataURL;
        document.getElementById("canvasimg").style.display = "inline";
    }

    function findxy(res, e) {
        socket.emit('findxy', {action : res, direction : e})
        if (res == 'down') {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;

            flag = true;
            dot_flag = true;
            if (dot_flag) {
                ctx.beginPath();
                ctx.fillStyle = x;
                ctx.fillRect(currX, currY, 2, 2);
                ctx.closePath();
                dot_flag = false;
            }
        }
        if (res == 'up' || res == "out") {
            flag = false;
        }
        if (res == 'move') {
            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = e.clientX - canvas.offsetLeft;
                currY = e.clientY - canvas.offsetTop;
                socket.emit('draw', {pX : prevX, pY : prevY, cX : currX, cY : currY})
                draw();
            }
        }
    }
//})