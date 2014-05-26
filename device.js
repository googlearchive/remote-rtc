//
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
function Device(videoElement, infoElement) {
  function log(msg) { console.log("Device: " + msg); }

  function PeerConnection(remote, configuration, constraints) {
    function expose(obj, src, method, casts) {
      obj[method] = function () {
        log(method);
        for (index in casts)
          arguments[index] = new (casts[index])(arguments[index]);
        src[method].apply(src, arguments);
      }
    }

    console.log("Creating connection.");
    var peer_connection = new RTCPeerConnection(configuration, constraints);

    expose(this, peer_connection, "close");
    expose(this, peer_connection, "createOffer");
    expose(this, peer_connection, "createAnswer");
    expose(this, peer_connection, "setRemoteDescription", { 0: RTCSessionDescription });
    expose(this, peer_connection, "setLocalDescription", { 0: RTCSessionDescription });
    expose(this, peer_connection, "addIceCandidate", { 0: RTCIceCandidate });

    expose(peer_connection, remote, "onicecandidate");

    //expose(peer_connection, remote, "onaddstream");
    peer_connection.onaddstream = function () {
      log("onaddstream");
      arguments[0] = { stream : URL.createObjectURL(arguments[0].stream) };
      console.log(arguments);
      remote.onaddstream.apply(remote, arguments);
    }
  }

  this.CreatePeerConnection = function(remote, callback, configuration, constraints) {
    var pc = new PeerConnection(remote, configuration, constraints);
    callback(pc);
  }

  this.SetCurrentMediaStream = function (mediastream) {
    log("SetCurrentMediaStream(" + mediastream + ")");
    videoElement.src = mediastream;
  }

  this.ShowInfo = function (info) {
    log("ShowInfo(" + info + ")");
    infoElement.innerHTML = '';
    infoElement.appendChild(document.createTextNode(info));
  }
}
