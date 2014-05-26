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
(function () {
  function log(message) {
    console.log("remote-rtc/googlecast: " + message);
  }

  if (window.connectToCastDevice) {
    log("including this script twice.");
    return;
  }

  var applicationId = '36EA9056';
  var namespace = 'urn:x-cast:remote-rtc';
  var state = "initiating";

  window.getCastReceiverState = function () {
    return state;
  }

  function receiverListener(e) { state = e; }

  window.connectToCastDevice = function(callback) {
    chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);

    function onRequestSessionSuccess(session) {
      log("Connected to " + session.receiver.friendlyName);

      // wait for a remote device object on expected namespace and construct
      // an interface to it.
      var channel = new MessageChannel();
      BindPortToCastNamespace(session, namespace, channel.port1);
      waitObject(function (remote) { callback(new RemoteDeviceInterface(remote)); }, channel.port2);
    }

    function onLaunchError() {
      log("Launch error: " + JSON.stringify(arguments));
    }

    function BindPortToCastNamespace(session, namespace, port) {
      function supportsNamespace(namespaces, namespace) {
        for (var i = 0; i < namespaces.length; ++i)
          if (namespaces[i].name === namespace)
            return true;
        return false;
      }

      if (!supportsNamespace(session.namespaces, namespace)) {
        log("namespace " + namespace + " not supported by session.");
        return;
      }

      session.addMessageListener(namespace, messageListener);

      function messageListener(namespace, message) {
        log("Cast[" + namespace + "]->Page: " + message);
        port.postMessage("" + message);
      }

      port.onmessage = function (e) {
        log("Page->Cast[" + namespace + "]: " + e.data);
        session.sendMessage(namespace, "" + e.data, successSend, failSend);

        function successSend() {}
        function failSend() {
          console.log(arguments);
          log("fail to send message: " + e.data);
        }
      }
    }
  }

  waitCastApi();

  function waitCastApi() {
    if (!chrome.cast || !chrome.cast.isAvailable) {
      setTimeout(waitCastApi, 1000);
    } else {
      initiate();
    }
  }

  function initiate() {
    log("Initialize cast");
    var sessionRequest = new chrome.cast.SessionRequest(applicationId);
    var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
                                              sessionListener,
                                              receiverListener,
                                              chrome.cast.AutoJoinPolicy.PAGE_SCOPED,
                                              chrome.cast.DefaultActionPolicy.CREATE_SESSION);

    chrome.cast.initialize(apiConfig, onInitSuccess, onError);

    function onInitSuccess() {
      log("initialize success");
    }

    function onError() {
      log("initialize error: " + JSON.stringify(arguments));
    }

    function sessionListener() {
      // Here we could join an already existent session.
      // console.log(arguments);
    }
  }
})();
