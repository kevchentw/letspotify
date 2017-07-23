function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function randomID() {
    var digits = function(length) {
        var bytes = crypto.getRandomValues(new Uint8Array(length))
        var str = ""
        for (var i = 0; i < bytes.length; i++) {
            str += bytes[i].toString(16)
        }
        return str;
    }
    return digits(4) + "-" + digits(2) + "-" + digits(2) + "-" + digits(2) + "-" + digits(6)
}
var deviceID = randomID();
var connectionID;
var activeDevices;
var local_current_uri;
var current_uri;
var current_track_index;
var ws_server_url = "wss://letspotify.nctu.me";


var send_spotify_msg = function(data){};

var wp_access_token = getCookie('wp_access_token');
var ws = new WebSocket("wss://gae-dealer.spotify.com/?access_token=" + getCookie('wp_access_token'));
ws.onmessage = function(e) {
    var data = JSON.parse(event.data);
    send_spotify_msg(data);
    if (!connectionID && data.uri) {
        connectionID = data.uri.split('/').pop();
        subscriptions();
        getActiveDevices();
    };
    if(data.type=='message'){
        try {
            current_uri = data.payloads[0].player_state.context_uri;
            current_track_index = data.payloads[0].player_state.index.track;
        }
        catch(err) {

        }
    }

}

function getActiveDevices() {
    var request = new XMLHttpRequest();
    request.open('GET', 'https://gae-spclient.spotify.com/connect-api/v2/devices', true);
    request.setRequestHeader('Authorization', 'Bearer ' + getCookie('wp_access_token'));
    request.send();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            var devices = JSON.parse(request.response);
            for (i in devices) {
                var device = devices[i];
                if (device.is_active) {
                    activeDevices = device.id;
                    break;
                }
            }
        }
    }
}

function subscriptions() {
    var data = {
        'connection_id': connectionID,
        'enable_discovery': false,
        'name': deviceID
    }

    var request = new XMLHttpRequest();
    request.open('POST', 'https://gae-spclient.spotify.com/connect-api/v2/state/subscriptions', true);
    request.setRequestHeader('Authorization', 'Bearer ' + getCookie('wp_access_token'));
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
        }
    }
    request.send(JSON.stringify(data));

}

function seek(time) {
    var data = {
        'value': time,
    }

    var request = new XMLHttpRequest();
    var url = "https://gae-spclient.spotify.com/connect-api/v2/from/" +
        deviceID + "/device/" + activeDevices + "/seek_to";

    request.open('POST', url, true);
    request.setRequestHeader('Authorization', 'Bearer ' + getCookie('wp_access_token'));
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
        }
    }
    request.send(JSON.stringify(data));
}

function seek(time) {
    var data = {
        'value': time,
    }

    var request = new XMLHttpRequest();
    var url = "https://gae-spclient.spotify.com/connect-api/v2/from/" +
        deviceID + "/device/" + activeDevices + "/seek_to";

    request.open('POST', url, true);
    request.setRequestHeader('Authorization', 'Bearer ' + getCookie('wp_access_token'));
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
        }
    }
    request.send(JSON.stringify(data));
}

function resume() {
    var request = new XMLHttpRequest();
    var url = "https://gae-spclient.spotify.com/connect-api/v2/from/" +
        deviceID + "/device/" + activeDevices + "/resume";

    request.open('POST', url, true);
    request.setRequestHeader('Authorization', 'Bearer ' + getCookie('wp_access_token'));
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
        }
    }
    request.send();
}

function pause() {
    var request = new XMLHttpRequest();
    var url = "https://gae-spclient.spotify.com/connect-api/v2/from/" +
        deviceID + "/device/" + activeDevices + "/pause";

    request.open('POST', url, true);
    request.setRequestHeader('Authorization', 'Bearer ' + getCookie('wp_access_token'));
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
        }
    }
    request.send();
}



function play(uri, url, track_index) {

    var data = {
    	"context": {
    		"uri": uri,
    		"url": url
    	},
    	"play_origin": {
    		"feature_identifier": "harmony",
    		"feature_version": "2.20.1-b224958"
    	},
    	"options": {
    		"skip_to": {
    			"track_index": track_index
    		},
    		"player_options_override": {
    			"shuffling_context": false
    		}
    	}
    }

    var request = new XMLHttpRequest();
    var url = "https://gae-spclient.spotify.com/connect-api/v2/from/" +
        deviceID + "/device/" + activeDevices + "/play";

    request.open('POST', url, true);
    request.setRequestHeader('Authorization', 'Bearer ' + getCookie('wp_access_token'));
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
        }
    }
    request.send(JSON.stringify(data));
}

ws.onopen = function(evt) {
    ws.send(JSON.stringify({
        type: "ping"
    }));
};
setInterval(function() {
    ws.send(JSON.stringify({
        type: "ping"
    }));

}, 30000);

var ws_state = {
    "pub": {
        "state": false,
        "name": "",
    },
    "sub": {
        "state": false,
        "name": "",
    }
}


var copy_icon_svg_html = '<div class="icon search-icon" id="copy_icon"> \
    <svg id="copy_svg" viewBox="0 0 27 28" xmlns="http://www.w3.org/2000/svg"><title>Copy</title><path d="m18.89767,5.99713l-3.21704,0l-3.21704,-2.99531l-7.50643,0l0,12.97966l6.43408,0l0,2.99531l10.72347,0l0,-9.98436l-3.21704,-2.99531zm-6.43408,-1.99687l2.14469,1.99687l-2.14469,0l0,-1.99687zm-6.43408,10.98279l0,-10.98279l5.36174,0l0,2.99531l3.21704,0l0,7.98749l-8.57878,0zm15.01286,2.99531l-8.57878,0l0,-1.99687l3.21704,0l0,-8.98592l2.14469,0l0,2.99531l3.21704,0l0,7.98749zm-2.14469,-8.98592l0,-1.99687l2.14469,1.99687l-2.14469,0z" fill="currentColor" fill-rule="evenodd"></path></svg> \
</div>'

setTimeout(
    function() {
        document.getElementsByClassName('navlist')[0].insertAdjacentHTML(
            'beforeend',
            '<div class="group"> \
                <li class="navlist-item"> \
                    <a class="navlist-itemlink ellipsis-one-line copy" id="create_room_id" data-clipboard-text="">No Room ID \
                     '+copy_icon_svg_html+' \
                    </a> \
                    <a class="navlist-itemlink ellipsis-one-line" id="room_create_btn">Create Room</a> \
                </li> \
            </div> \
            <div class="group"> \
                <input type="text" style="font-size: 15px;" value="" id="room_id" placeholder="Insert Room ID...." class="inputBox-input"> \
                <li class="navlist-item"> \
                    <a class="navlist-itemlink ellipsis-one-line" id="room_connect_btn">Connect Room</a> \
                </li> \
            </div>'
        );
        new Clipboard('.copy');
        var room_create_btn = document.getElementById('room_create_btn');
        var room_connect_btn = document.getElementById('room_connect_btn');
        var copy_icon = document.getElementById('copy_icon');
        var copy_svg = document.getElementById('copy_svg');
        copy_svg.setAttribute('visibility', 'hidden');
        var ws_pub;
        var ws_sub;

        room_create_btn.addEventListener("click", function(){
            if (!ws_state.pub.state) {
                var room_name = Math.random().toString(36).substr(2, 4).toUpperCase();
                ws_pub = new WebSocket(ws_server_url + ':8765/' + room_name);
                ws_pub.onopen = function(){
                    document.getElementById('create_room_id').text = "ID: " + room_name;
                    document.getElementById('create_room_id').dataset.clipboardText = room_name;
                    document.getElementById('create_room_id').insertAdjacentHTML('beforeend', copy_icon_svg_html);
                    document.getElementById('create_room_id').style.color = "#1db954";
                    room_create_btn.text = "Disconnect";
                    ws_state.pub.state = true;
                    ws_state.pub.name = room_name;
                    copy_svg.setAttribute('visibility', 'visible');
                    send_spotify_msg = function(data){
                        if(data.type=='message'){
                            if(data.payloads[0].player_state.context_uri){
                                data = {
                                    'uri': data.payloads[0].player_state.context_uri,
                                    'url': "context://" + data.payloads[0].player_state.context_uri,
                                    'track_index': data.payloads[0].player_state.index.track
                                }
                                ws_pub.send(JSON.stringify(data));
                            }
                        }
                    }
                }

                ws_pub.onclose = function() {
                    document.getElementById('create_room_id').text = "No Room ID";
                    document.getElementById('create_room_id').dataset.clipboardText = '';
                    document.getElementById('create_room_id').style.color = "";
                    room_create_btn.text = "Create Room";
                    ws_state.pub.state = false;
                    ws_state.pub.name = room_name;
                    copy_svg.setAttribute('visibility', 'hidden');
                    send_spotify_msg = function(data){};
                }
            }
            else {
                ws_pub.close();
            }
        });

        room_connect_btn.addEventListener("click", function(){
            if (!ws_state.sub.state) {
                var room_name = document.getElementById('room_id').value;
                ws_sub = new WebSocket(ws_server_url + ':8767/' + room_name);
                ws_sub.onopen = function(){
                    room_connect_btn.text = "Disconnect";
                    document.getElementById('room_id').style.color = "#1db954";
                    ws_state.sub.state = true;
                    ws_state.sub.name = room_name;
                }

                ws_sub.onclose = function() {
                    room_connect_btn.text = "Connect Room";
                    document.getElementById('room_id').style.color = "";
                    ws_state.sub.state = false;
                    ws_state.sub.name = room_name;
                }

                ws_sub.onmessage = function(event) {
                    var data = JSON.parse(event.data);

                    if(data.uri && data.url && (data.uri != current_uri || data.track_index != current_track_index)){
                        play(data.uri, data.url, data.track_index);
                    }
                }
            }
            else {
                ws_sub.close();
            }

        });

    }, 1000
);
