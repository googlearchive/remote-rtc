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
var Duplex = require('stream').Duplex;
var inherits = require('inherits');
var dnode = require('dnode');

inherits(WebMessageChannel, Duplex);
function WebMessageChannel(port) {
  Duplex.call(this, null);

  var self = this;
  port.onmessage = function (message) {
    // console.log("Receive: " + message.data);
    self.push("" + message.data);
  }

  this._write = function (chunk, encoding, callback) {
    // console.log("Send: " + chunk);
    port.postMessage("" + chunk);
    callback();
  }

  this._read = function (size) {}
}

window.exposeObject = function (obj, port) {
  var d = new dnode(obj);
  d.on('error', function (error) { console.log(error); });
  d.pipe(new WebMessageChannel(port)).pipe(d);
}

window.waitObject = function (callback, port) {
  var d = new dnode();
  d.on('remote', function (remote) { callback(remote); });
  d.on('error', function (error) { console.log(error); });
  d.pipe(new WebMessageChannel(port)).pipe(d);
}
