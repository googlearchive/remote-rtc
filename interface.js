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
function RemoteDeviceInterface(remote) {
  this.CreatePeerConnection = function(callback, configuration, constraints) {
    var obj = {};
    var exported = {
      onicecandidate: function () {
        if (obj.onicecandidate) obj.onicecandidate.apply(obj, arguments);
      },
      onaddstream: function () {
        if (obj.onaddstream) obj.onaddstream.apply(obj, arguments);
      }
    };
    function oncreated(connection) {
      for (key in connection) obj[key] = connection[key].bind(connection);
      callback(obj);
    }
    remote.CreatePeerConnection(exported, oncreated, configuration, constraints);
  }

  this.SetCurrentMediaStream = function(stream) {
    remote.SetCurrentMediaStream(stream);
  }

  this.ShowInfo = function () {
    if (remote.ShowInfo) remote.ShowInfo.apply(remote, arguments);
    else console.log("ShowInfo not supported by remote device");
  }
}
