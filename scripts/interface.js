
                        var deg2rad = Math.PI / 180;
                        var rad2deg = 180 / Math.PI;

                        var pitch =0;
                        var roll =0;
                        var yaw = 0;

                        var jsoncount=0;
                        var markers = [];
                        var wpmarkers = [];
                        var flightPath;
                        var pathHistoryPoly;
                        var pathHistory = [];
                        var socket;
                        var socket2;

                        var line1item = "cs.altasl";
                        var line2item = "cs.ter_alt";

                        function graphitem(item)
                        {
                            line1item = "cs."+item;
                        }

                        function init() {

                                var smoothie = new SmoothieChart();

                        smoothie.streamTo(document.getElementById("graphcanvas"),250);

                        // Data
                        var line1 = new TimeSeries();
                        var line2 = new TimeSeries();

            // Add to SmoothieChart
            smoothie.addTimeSeries(line1);
            smoothie.addTimeSeries(line2);
    if (window["WebSocket"]) {
        var host = "http://" + window.location.hostname + ":5000/test";
        if (window.location.hostname == "")
            host = "http://localhost:5000/test";
        try {
            socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
            socket.on('ar', function(msg) {
                let num = parseFloat(msg.message);
                num = num * 180 / Math.PI;
                //$('#roll').html(num);
                console.log(num);
                roll = num;
            });
            socket.on('ap', function(msg) {
                let num = parseFloat(msg.message);
                num = num * 180 / Math.PI;
                //$('#roll').html(num);
                console.log(num);
                pitch = num;
            });
            socket.on('ay', function(msg) {
                let num = parseFloat(msg.message);
                num = num * 180 / Math.PI;
                //$('#roll').html(num);
                console.log(num);
                yaw = num;
                if (yaw < 0)
                    document.getElementById("yaw").innerHTML = (yaw + 360.00).toFixed(2)
                else
                    document.getElementById("yaw").innerHTML = yaw.toFixed(2);
            });
            socket.on('mcowpd', function(msg) {
                let num = parseFloat(msg.message);
                document.getElementById("wpdist").innerHTML = num.toFixed(2);
            });
            socket.on('gpsialt', function(msg) {
                let num = parseFloat(msg.message);
                document.getElementById("alt").innerHTML = (num / 1000).toFixed(2);
            });
            socket.on('gpsivz', function(msg) {
                let num = parseFloat(msg.message);
                document.getElementById("vs").innerHTML = num.toFixed(2);
            });
            socket.on('vfrhgs', function(msg) {
                let num = parseFloat(msg.message);
                document.getElementById("gs").innerHTML = num.toFixed(2);
            });
            window.onbeforeunload = function() {
                    socket.close();
                    socket2.close();
                }
                // log('WebSocket - status '+socket.readyState);
            socket.onopen = function(msg) {
                document.getElementById("serverStatus").innerHTML = "onopen";
                jsoncount = 0;
            };
            socket.onmessage = function(msg) {
                jsoncount++;

                var data = JSON.parse(msg.data);

                if (data.hasOwnProperty('FrameString')) {
                    MAV = data;
                } else if (data.hasOwnProperty('rateattitude')) {
                    cs = data;

                    var status = "<ul style='columns: 3;'>";

                    a = 1;

                    var sortable = [];
                    for (i in cs) {
                        sortable.push(i);
                    }

                    sortable.sort(function(a, b) {
                        return a.toLowerCase().localeCompare(b.toLowerCase());
                    });

                    for (i in sortable) {
                        var name = sortable[i];
                        var data = cs[sortable[i]];

                        if (typeof data != 'object')
                            status += "<li style='overflow:hidden; white-space: nowrap;'><b onclick=graphitem('" + name + "')>" + name + ":</b><br> " + data + "</li>";

                        //if(a%3==0)
                        //status += "<br>";

                        a++;
                    }

                    status += "</ul>";

                    document.getElementById("serverStatus").innerHTML = status;

                    // map.setCenter({lat: cs.lat, lng: cs.lng});

                    if (jsoncount < 5) {
                        map.setZoom(18);
                    }

                    roll = cs.roll;
                    pitch = cs.pitch;
                    yaw = cs.yaw;

                    lat = cs.lat;
                    lng = cs.lng;
                    alt = cs.alt;

                    try {

                        var myLatLng = { lat: lat, lng: lng };

                        if (markers.length > 0) {
                            markers[0].setPosition(myLatLng);
                        } else {
                            var marker = new google.maps.Marker({
                                position: myLatLng,
                                map: map,
                                title: 'ArduPilot'
                            });

                            markers.push(marker);
                        }

                        map.setOptions({ maxZoom: 21 });

                        //socket.send("test "+pitch+"\n");
                    } catch (ex) {} // alert(ex); }

                    line1.append(new Date().getTime(), eval(line1item));
                    line2.append(new Date().getTime(), eval(line2item));

                    addData();

                    pathHistory.push({ lat: lat, lng: lng });

                    pathHistory = pathHistory.slice(-200, 200);

                    if (pathHistoryPoly == null) {
                        pathHistoryPoly = new google.maps.Polyline({
                            path: pathHistory,
                            geodesic: true,
                            strokeColor: '#191970',
                            strokeOpacity: 0.56,
                            strokeWeight: 4
                        });

                        pathHistoryPoly.setMap(map);
                    } else {
                        pathHistoryPoly.setPath(pathHistory);
                    }
                } else if (data[0].hasOwnProperty('mission_type')) {
                    wps = data;

                    var wpscoords = [];
                    for (i in wps) {
                        if (wps[i].x != 0 && wps[i].y != 0) {
                            wpscoords.push({ lat: wps[i].x, lng: wps[i].y, alt: wps[i].z, frame: wps[i].frame, label: wps[i].seq });
                        }
                    }

                    if (wpmarkers.length == wpscoords.length) {
                        i = 0;
                        wpmarkers.forEach(function(element) {
                            element.setPosition(wpscoords[i]);
                            i++;
                        });
                    } else {
                        wpmarkers.forEach(function(element) { element.setMap(null) });
                        wpmarkers = [];
                        // Create markers.
                        wpscoords.forEach(function(feature) {
                            var marker = new google.maps.Marker({
                                position: feature,
                                icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/green.png',
                                map: map,
                                label: (feature.label == 0) ? "Home" : feature.label + "",
                                draggable: true,
                                title: (feature.label == 0) ? "Home" : feature.label + ""
                            });
                            wpmarkers.push(marker);

                            google.maps.event.addListener(marker, 'dragend', function(event) {
                                document.getElementById("latbox").value = event.latLng.lat();
                                document.getElementById("lngbox").value = event.latLng.lng();
                            });
                        });
                    }

                    var pnts = [];
                    wpscoords.forEach(function(feature) {
                        pnts.push(feature.lng);
                        pnts.push(feature.lat);
                        pnts.push(feature.alt + cs.HomeAlt);
                    });

                    if (typeof viewer !== 'undefined') {
                        var orangeOutlined = viewer.entities.add({
                            name: 'Orange line with black outline at height and following the surface',
                            polyline: {
                                positions: Cesium.Cartesian3.fromDegreesArrayHeights(pnts),
                                width: 4,
                                material: new Cesium.PolylineOutlineMaterialProperty({
                                    color: Cesium.Color.ORANGE,
                                    outlineWidth: 2,
                                    outlineColor: Cesium.Color.BLACK
                                })
                            }
                        });

                        //orangeOutlined.position = Cesium.Cartesian3.fromDegrees(lng, lat);

                        //viewer.trackedEntity = orangeOutlined;
                    }

                    if (flightPath == null) {
                        flightPath = new google.maps.Polyline({
                            path: wpscoords,
                            geodesic: true,
                            strokeColor: '#FFFF00',
                            strokeOpacity: 1.0,
                            strokeWeight: 4
                        });

                        flightPath.setMap(map);
                    } else {
                        flightPath.setPath(wpscoords);
                    }

                } else { return; }

            };
            socket.onerror = function(msg) { document.getElementById("serverStatus").innerHTML = "Error: " + msg.data; };
            socket.onclose = function(msg) {
                document.getElementById("serverStatus").innerHTML = "Disconnected - status " + this.readyState;
                setTimeout("init()", 1000);
            };
        } catch (ex) {
            if (window.console) console.log(exception);
            document.getElementById("serverStatus").innerHTML = ex;
        }
    } 
                        else {
                        document.getElementById("serverStatus").innerHTML = "This browser doesnt support websockets";
                        }

                        draw();

                        }

                        function draw() {

                        setTimeout ( "draw()", 250 );

                        // pitch += 1.2;
                        // roll += .75;

                        // if (pitch < -90)
                        // pitch = 90;
                        // if (roll > 180)
                        // roll = -180;

                          var canvas = document.getElementById("canvas");
                          if (canvas.getContext) {
                            var ctx = canvas.getContext("2d");

                            ctx.save();

                            ctx.translate(canvas.width/2,canvas.height/2);

                            ctx.rotate(-roll * deg2rad);

                            var font = "Arial";
                            var fontsize = canvas.height/30;
                            var fontoffset = fontsize - 10;

                            var halfwidth = canvas.width/2;
                            var halfheight = canvas.height/2;

                            var every5deg = -canvas.height / 60;

                            var pitchoffset = -pitch * every5deg;

                            var x = Math.sin(-roll * deg2rad);
                            var y = Math.cos(-roll * deg2rad);

                     gradObj = ctx.createLinearGradient(0,-halfheight * 2 ,0, halfheight *2);
                     gradObj.addColorStop(0.0, "Blue");
                     var offset = 0.5 + pitchoffset / canvas.height / 2 ;
                     if (offset < 0) {
                        offset = 0;
                     }
                     if (offset > 1) {
                        offset = 1;
                     }
                     gradObj.addColorStop(offset, "LightBlue");
                     gradObj.addColorStop(offset, "#9bb824");
                     gradObj.addColorStop(1.0, "#414f07");

                     ctx.fillStyle = gradObj;
                     ctx.rect(-halfwidth * 2, -halfheight *2, halfwidth * 4, halfheight * 4);
                     ctx.fill();

                                    var lengthshort = canvas.width / 12;
                                    var lengthlong = canvas.width / 8;

                                    for (var a = -90; a <= 90; a += 5)
                                    {
                                        // limit to 40 degrees
                                        if (a >= pitch - 34 && a <= pitch + 25)
                                        {
                                            if (a % 10 == 0)
                                            {
                                                if (a == 0)
                                                {
                                                    DrawLine(ctx,"White",4, canvas.width / 2 - lengthlong - halfwidth, pitchoffset + a * every5deg, canvas.width / 2 + lengthlong - halfwidth, pitchoffset + a * every5deg);
                                                }
                                                else
                                                {
                                                    DrawLine(ctx,"White",4, canvas.width / 2 - lengthlong - halfwidth, pitchoffset + a * every5deg, canvas.width / 2 + lengthlong - halfwidth, pitchoffset + a * every5deg);
                                                }
                                                drawstring(ctx, a, font, fontsize + 2, "White", canvas.width / 2 - lengthlong - 30 - halfwidth - (fontoffset * 1.7), pitchoffset + a * every5deg - 8 - fontoffset);
                                            }
                                            else
                                            {
                                                DrawLine(ctx,"White",4, canvas.width / 2 - lengthshort - halfwidth, pitchoffset + a * every5deg, canvas.width / 2 + lengthshort - halfwidth, pitchoffset + a * every5deg);
                                            }
                                        }
                                    }

                                    lengthlong = canvas.height / 66;

                                    var extra = canvas.height / 15 * 4.9;

                                    var lengthlongex = lengthlong + 2;

                     var pointlist = new Array();
                     pointlist[0] = 0;
                     pointlist[1] = -lengthlongex * 2 - extra;
                     pointlist[2] = -lengthlongex;
                     pointlist[3] = -lengthlongex - extra;
                     pointlist[4] = lengthlongex;
                     pointlist[5] = -lengthlongex - extra;

                        DrawPolygon(ctx,"RED",4,pointlist)

                                        for (var a = -60; a <= 60; a += 15)
                                    {
                                        ctx.restore();
                                        ctx.save();
                                        ctx.translate(canvas.width / 2, canvas.height / 2);
                                        ctx.rotate(a * deg2rad);
                                        drawstring(ctx, a.toString(), font, fontsize, "White", 0 - 6 - fontoffset, -lengthlong * 8 - extra + 10);
                                        DrawLine(ctx,"White",4, 0, -lengthlong * 3 - extra, 0,
                                        -lengthlong * 3 - extra - lengthlong);

                                    }

                                    ctx.restore();
                                    ctx.save();

                                    DrawEllipse(ctx,"red",4,halfwidth - 10, halfheight - 10, 20, 20);
                                    DrawLine(ctx,"red",4, halfwidth - 10 - 10, halfheight, halfwidth - 10, halfheight);
                                    DrawLine(ctx,"red",4, halfwidth - 10 + 20, halfheight, halfwidth - 10 + 20 + 10, halfheight);
                                    DrawLine(ctx,"red",4, halfwidth - 10 + 20 / 2,  halfheight - 10, halfwidth - 10 + 20 / 2,  halfheight - 10 - 10);

              ///////////////////////

              var headbg = {Left:0, Top: 0, Width: canvas.width - 0, Height: canvas.height / 14, Bottom: canvas.height / 14,  Right: canvas.width - 0 };

              _targetheading = yaw;
              _heading = yaw;
              _groundcourse = yaw;

              DrawRectangle(ctx,"black", headbg);

                                //FillRectangle(ctx,"", headbg);

                                //bottom line
                                DrawLine(ctx, "white", 2, headbg.Left + 5, headbg.Bottom - 5, headbg.Width - 5,
                                    headbg.Bottom - 5);

                                var space = (headbg.Width - 10) / 120.0;
                                var start = Math.round((_heading - 60), 1);

                                // draw for outside the 60 deg
                                if (_targetheading < start)
                                {

                                    DrawLine(ctx,"green", 2, headbg.Left + 5 + space * 0, headbg.Bottom,
                                        headbg.Left + 5 + space * (0), headbg.Top);
                                }
                                if (_targetheading > _heading + 60)
                                {

                                    DrawLine(ctx,"green", 2, headbg.Left + 5 + space * 60, headbg.Bottom,
                                        headbg.Left + 5 + space * (60), headbg.Top);
                                }

                                for (var a = start; a <= _heading + 60; a += 1)
                                {
                                    // target heading
                                    if (( (a + 360) % 360) ==  Math.round(_targetheading))
                                    {

                                        DrawLine(ctx,"green", 2, headbg.Left + 5 + space * (a - start),
                                            headbg.Bottom, headbg.Left + 5 + space * (a - start), headbg.Top);
                                    }

                                    if (( (a + 360) % 360) ==  Math.round(_groundcourse))
                                    {

                                        DrawLine(ctx,"black", 2, headbg.Left + 5 + space * (a - start),
                                            headbg.Bottom, headbg.Left + 5 + space * (a - start), headbg.Top);

                                    }

                                    if ( a % 15 == 0)
                                    {
                                        //Console.WriteLine(a + " " + Math.Round(a, 1, MidpointRounding.AwayFromZero));
                                        //Console.WriteLine(space +" " + a +" "+ (headbg.Left + 5 + space * (a - start)));
                                        DrawLine(ctx,"white", 2, headbg.Left + 5 + space * (a - start),
                                            headbg.Bottom - 5, headbg.Left + 5 + space * (a - start), headbg.Bottom - 10);
                                        var disp =  a;
                                        if (disp < 0)
                                            disp += 360;
                                        disp = disp % 360;
                                        if (disp == 0)
                                        {
                                            drawstring(ctx, "N", font, fontsize + 4, "white",
                                                headbg.Left - 5 + space * (a - start) - fontoffset,
                                                headbg.Bottom - 24 -  (fontoffset * 1.7));
                                        }
                                        else if (disp == 45)
                                        {
                                            drawstring(ctx, "NE", font, fontsize + 4, "white",
                                                headbg.Left - 5 + space * (a - start) - fontoffset,
                                                headbg.Bottom - 24 -  (fontoffset * 1.7));
                                        }
                                        else if (disp == 90)
                                        {
                                            drawstring(ctx, "E", font, fontsize + 4, "white",
                                                headbg.Left - 5 + space * (a - start) - fontoffset,
                                                headbg.Bottom - 24 -  (fontoffset * 1.7));
                                        }
                                        else if (disp == 135)
                                        {
                                            drawstring(ctx, "SE", font, fontsize + 4, "white",
                                                headbg.Left - 5 + space * (a - start) - fontoffset,
                                                headbg.Bottom - 24 -  (fontoffset * 1.7));
                                        }
                                        else if (disp == 180)
                                        {
                                            drawstring(ctx, "S", font, fontsize + 4, "white",
                                                headbg.Left - 5 + space * (a - start) - fontoffset,
                                                headbg.Bottom - 24 -  (fontoffset * 1.7));
                                        }
                                        else if (disp == 225)
                                        {
                                            drawstring(ctx, "SW", font, fontsize + 4, "white",
                                                headbg.Left - 5 + space * (a - start) - fontoffset,
                                                headbg.Bottom - 24 -  (fontoffset * 1.7));
                                        }
                                        else if (disp == 270)
                                        {
                                            drawstring(ctx, "W", font, fontsize + 4, "white",
                                                headbg.Left - 5 + space * (a - start) - fontoffset,
                                                headbg.Bottom - 24 -  (fontoffset * 1.7));
                                        }
                                        else if (disp == 315)
                                        {
                                            drawstring(ctx, "NW", font, fontsize + 4, "white",
                                                headbg.Left - 5 + space * (a - start) - fontoffset,
                                                headbg.Bottom - 24 -  (fontoffset * 1.7));
                                        }
                                        else
                                        {
                                            drawstring(ctx, Math.round(disp % 360,0), font, fontsize,
                                                "white", headbg.Left - 5 + space * (a - start) - fontoffset,
                                                headbg.Bottom - 24 -  (fontoffset * 1.7));
                                        }
                                    }
                                    else if ( a % 5 == 0)
                                    {
                                        DrawLine(ctx,"white", 2, headbg.Left + 5 + space * (a - start),
                                            headbg.Bottom - 5, headbg.Left + 5 + space * (a - start), headbg.Bottom - 10);
                                    }
                                }

                          }

                        }
                        function DrawEllipse(ctx,color,linewidth,x1,y1,width,height) {
                            ctx.lineWidth = linewidth;
                            ctx.strokeStyle = color;
                            ctx.beginPath();
                            ctx.moveTo(x1 + width / 2,y1 + height);
                                            var x, y;
                                    for (var i = 0; i <= 360; i += 1)
                                    {
                                        x = Math.sin(i * deg2rad) * width / 2;
                                        y = Math.cos(i * deg2rad) * height  / 2;
                                        x = x + x1 + width / 2;
                                        y = y + y1 + height / 2;
                                        ctx.lineTo(x,y);
                                    }

                            //ctx.moveTo(x1,y1);

                            ctx.stroke();
                            ctx.closePath();
                        }
                        function DrawLine(ctx,color,width,x1,y1,x2,y2) {
                            ctx.lineWidth = width;
                            ctx.strokeStyle = color;
                            ctx.beginPath();
                            ctx.moveTo(x1,y1);
                            ctx.lineTo(x2,y2);
                            ctx.stroke();
                            ctx.closePath();
                        }
                        function DrawPolygon(ctx,color,width,list) {
                            ctx.lineWidth = width;
                            ctx.strokeStyle = color;
                            ctx.beginPath();
                            ctx.moveTo(list[0],list[1]);
                            for ( var i=2, len=list.length; i<len; i+=2 ){
                                ctx.lineTo(list[i],list[i+1]);
                            }
                            ctx.lineTo(list[0],list[1]);
                            ctx.stroke();
                            ctx.closePath();
                        }
                        function DrawRectangle(ctx,color, headbg) {
                            DrawLine(ctx,color,2,headbg.Left, headbg.Top, headbg.Right, headbg.Top);
                            DrawLine(ctx,color,2,headbg.Right, headbg.Top, headbg.Right, headbg.Bottom);
                            DrawLine(ctx,color,2,headbg.Right, headbg.Bottom, headbg.Left, headbg.Bottom);
                            DrawLine(ctx,color,2,headbg.Left, headbg.Bottom, headbg.Left, headbg.Top);
                        }
                        function  drawstring(ctx,string,font,fontsize,color,x,y) {
                            ctx.font = fontsize + "pt "+font;
                            ctx.fillStyle = color;
                            ctx.fillText(string,x,y + fontsize);
                                                               }

        var map;

        function initMap() {
            map = new google.maps.Map(document.getElementById('map'),
                {
                    center: { lat: -35, lng: 117.89 },
                    zoom: 8,
                    mapTypeId: 'satellite',
                    maxZoom: 21
                });

            map.setMapTypeId('satellite');
        }

        // var viewer = new Cesium.Viewer('cesiumContainer');

        google.charts.load('current', { 'packages': ['corechart'] });
        google.charts.setOnLoadCallback(drawChart);
        var options;
        var data;
        var chart;

        function drawChart() {
            data = new google.visualization.DataTable();
            data.addColumn('date', 'Time');
            data.addColumn('number', line1item);
            data.addColumn('number', line2item);

            data.addRows([]);

            options = {
                title: 'Graph',
                curveType: 'function',
                legend: { position: 'top' },
                hAxis: {
                    format: 'hh:mm:ss',
                    gridlines: { count: 15 }
                },
                chartArea: { left: '5%', top: '15%', width: '90%', height: '80%' }
            };

            chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

            chart.draw(data, options);

            setTimeout("redrawchart()", 1000);
        }

        function addData() {
            if (data.getNumberOfRows() > 200)
                data.removeRow(0);

            data.addRows([
                [new Date(), eval(line1item), eval(line2item)]
            ]);
        }

        function redrawchart() {
            setTimeout("redrawchart()", 1000);

            chart.draw(data, options);
        }


        var jsilConfig = {
            printStackTrace: true,

            xna: 4,

            showProgressBar: true,

            winForms: true,

            libraryRoot: "/mav/Libraries/",

            scriptRoot: "/mav/mavlink/",

            fileRoot: "/mav/file/",

            bclMode11: "translated",

            manifests: [
                "/mav/mavlink/MAVLink.dll"
            ],

        };

        //runMain();

        //onLoad();

        //JSIL.Initialize();

        //var asm = JSIL.GetAssembly("MAVLink");

        function runMain() {

            //################################################
            try {
                var host = "ws://" + window.location.hostname + ":56781/websocket/raw";
                if (window.location.hostname == "")
                    host = "ws://localhost:56781/websocket/raw";
                socket2 = new WebSocket(host);
                log('WebSocket - status '+socket.readyState);
                socket2.onopen = function (msg) { document.getElementById("serverStatus").innerHTML = "onopen"; };
                socket2.onmessage = function (msg) {
                    var reader = new FileReader();
                    reader.addEventListener("loadend", function () {

                        var m = new MAVLink();
                        var buf = Buffer.from(this.result);
                        var msg2 = m.parseBuffer(buf);

                        //var packet = new asm.MAVLink_MAVLinkMessage(new Uint8Array(this.result));

                        document.getElementById("message").innerHTML = msg2[0].name + '';

                    });
                    reader.readAsArrayBuffer(msg.data);
                };
                socket2.onerror = function (msg) {
                    document.getElementById("serverStatus").innerHTML = "Error: " + msg.data;
                };
                socket2.onclose = function (msg) {
                    document.getElementById("serverStatus").innerHTML = "Disconnected - status " + this.readyState;
                    setTimeout("runMain()", 1000);
                };
            } catch (ex) {
                if (window.console) console.log(exception);
                document.getElementById("serverStatus").innerHTML = ex;
            }

            //############################################################
            //var test = new asm.MAVLink();

            //var test2 = new asm.MAVLink_MAVLinkMessage();

            //var parse = new asm.MAVLink_MavlinkParse();
        }


        // getting the data 
    $(document).ready(function(){
        // connect to the socket server.
        var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
        //receive details from server
        socket.on('pixhawkdata', function(msg) {
            //console.log("Received number" + msg.message);
            //maintain a list of ten numbers
            $('#log').html(msg.message);
        });
        socket.on('ar',function(msg){
            let num = parseFloat(msg.message);
            num = num * 180/Math.PI;
            $('#roll').html(num);
        });
        socket.on('ap',function(msg){
            let num = parseFloat(msg.message);
            num = num * 180/Math.PI;
            $('#pitch').html(num);
        });
        socket.on('ay',function(msg){
            let num = parseFloat(msg.message);
            num = num * 180/Math.PI;
            $('#yaw').html(num);
        });
    })




const mapview=document.querySelector('#switch');

var map = L.map('map').setView([14.0860746, 100.608406], 6);
mapLink = 
            '<a href="http://www.esri.com/">Esri</a>';
        wholink = 
            'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; '+mapLink+', '+wholink,
            maxZoom: 18,
            }).addTo(map);;
            mapview.addEventListener('click',()=>{
                L.tileLayer(
                    'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: '&copy; '+mapLink+', '+wholink,
                    maxZoom: 18,
                    }).addTo(map);;
                    mapview.textContent="Street View"
                    mapview.addEventListener('dblclick',()=>{
                        L.tileLayer(
                            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; '+mapLink+', '+wholink,
                            maxZoom: 18,
                            }).addTo(map);;
                            mapview.textContent="Satellite View"
                    })
            })
            

    if(!navigator.geolocation) {
        console.log("Your browser doesn't support geolocation feature!")
    } else {
    //     setInterval(() => {
    //         navigator.geolocation.getCurrentPosition(getPosition)
    //     }, 1000);
    // }
                navigator.geolocation.getCurrentPosition(getPosition)}

    var marker, circle;

    function getPosition(position){
        console.log(position)
        var lat = position.coords.latitude;
        var long = position.coords.longitude;
        var accuracy = position.coords.accuracy;

        if(marker) {
            map.removeLayer(marker)
        }

        if(circle) {
            map.removeLayer(circle)
        }

        marker = L.marker([lat, long])
        circle = L.circle([lat, long], {radius: accuracy})

        var featureGroup = L.featureGroup([marker, circle]).addTo(map)

        map.fitBounds(featureGroup.getBounds())

        // console.log("Your coordinate is: Lat: "+ lat +" Long: "+ long+ " Accuracy: "+ accuracy)
    }
