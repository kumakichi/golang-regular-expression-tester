<!-- code comes from : http://www.tutorialspoint.com/html5/html5_websocket.htm -->
var NOT_ESTABLISHED = 0;
var ESTABLISHED = 1;
var CLOSING_HANDSHAKE = 2;
var CLOSED = 3;
validate_url = "ws://localhost:3000/regvalidate";

function add_rm_alert_event_listener() {
    $("button.close").each(function () {
        $(this).click(function(){
            $(document).trigger("clear-alerts");
        });
    });
}

function log(param) {
    show_alert_by_id("set-alert-id-sans-blank", param)
}

function show_alert_by_id(id, msg) {
    $(document).trigger(id, [
        {
            'message': msg,
            'priority': 'warning'
        }
    ]);
    add_rm_alert_event_listener();
}

function new_web_sock(url) {
    w = new WebSocket(url);
    w.binaryType = 'arraybuffer';

    w.onopen = function() {
        //log("WebSocket already opened!");
        var msg_data = new Object();
        msg_data.msg_id="sync";
        msg_data.msg_body="this is a websocket request!";
        send_valite_data(w, JSON.stringify(msg_data));
    }

    w.onmessage=function(e){
        if (e.data instanceof ArrayBuffer) {
            str = String.fromCharCode.apply(null, new Uint8Array(e.data));
            show_result(str);
            // arr = JSON.parse(str);
            // console.log(arr)
        }
        // log(String(e.data instanceof ArrayBuffer));

        // var xx = new Object(e.data);
        // str = String.fromCharCode.apply(null, bytearray);
        // log(e.data+typeof(e.data));
    }

    w.onerror=function(e){
        log("Error" + e.data);
    }

    w.onclose=function(e) {
        log("server closed the connection!");
    }
    return w;
}


function send_valite_data(w, param) {
    if(w.readyState === ESTABLISHED)
        w.send(param);
    else
        show_alert_by_id("set-alert-id-sans-blank", "websocket stat is not ok, it is " + w.readyState);
}
