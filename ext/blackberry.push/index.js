/*
* Copyright 2012 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function requireLocal(id) {
    return !!require.resolve ? require("../../" + id) : window.require(id);
}

var _push,
    _methods = ["startService", "createChannel", "destroyChannel", "extractPushPayload", "launchApplicationOnPush", "acknowledge"],
    _event = requireLocal("lib/event"),
    _exports = {};

/* ToDo:
 * will optimize the JavaScript code using the following codes
 * though I need to work on native code first for now

_exports.init = function (methods) {
    for (m in methods) {
        if (methods.hasOwnProperty(m)) {
            _exports[m] = function (success, fail, args) {
                try {
                    success(push[m](args));
                } catch (e) {
                    fail(-1, e);
                }
            }
        }
    }

    return _exports;
}

module.exports = _exports.init(_methods);
*/

module.exports = {
    startService: function (success, fail, args) {
        success(_push.startService(args));
    },

    createChannel: function (success, fail, args) {
        success(_push.createChannel(args));
    },

    destroyChannel: function (success, fail, args) {
        success(_push.destroyChannel(args));
    },

    extractPushPayload: function (success, fail, args) {
        success(_push.extractPushPayload(args));
    },

    launchApplicationOnPush: function (success, fail, args) {
        success(_push.launchApplicationOnPush(args));
    },

    acknowledge: function (success, fail, args) {
        success(_push.acknowledge(args));
    }
};

///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT plugin
///////////////////////////////////////////////////////////////////

JNEXT.Push = function () {
    var self = this;

    self.startService = function (args) {
        var val = JNEXT.invoke(self.m_id, "startService " + JSON.stringify(args));
        return val;
    };

    self.createChannel = function (args) {
        var val = JNEXT.invoke(self.m_id, "createChannel " + JSON.stringify(args));
        return val;
    };

    self.destroyChannel = function (args) {
        var val = JNEXT.invoke(self.m_id, "destroyChannel " + JSON.stringify(args));
        return val;
    };

    self.extractPushPayload = function (args) {
        var val = JNEXT.invoke(self.m_id, "extractPushPayload " + JSON.stringify(args));
        return val;
    };

    self.launchApplicationOnPush = function (args) {
        var val = JNEXT.invoke(self.m_id, "launchApplicationOnPush " + JSON.stringify(args));
        return val;
    };

    self.acknowledge = function (args) {
        var val = JNEXT.invoke(self.m_id, "acknowledge " + JSON.stringify(args));
        return val;
    };

    self.getId = function () {
        return self.m_id;
    };

    self.init = function () {
        if (!JNEXT.require("pushJNext")) {
            return false;
        }

        self.m_id = JNEXT.createObject("pushJNext.Push");

        if (self.m_id === "") {
            return false;
        }

        JNEXT.registerEvents(self);
    };

    self.onEvent = function (strData) {
        var arData = strData.split(" "),
            strEventId = arData[0],
            args = arData[1];

        // Trigger the event handler of specific Push events
        // Although there are redundant strings
        // It's meant to show you what specfic events are expected to receive
        if (strEventId === "blackberry.push.create.successCallback") {
            _event.trigger("blackberry.push.create.successCallback", JSON.parse(args));
        } else if (strEventId === "blackberry.push.create.failCallback") {
            _event.trigger("blackberry.push.create.failCallback", JSON.parse(args));
        } else if (strEventId === "blackberry.push.create.simChangeCallback") {
            _event.trigger("blackberry.push.create.simChangeCallback", JSON.parse(args));
        } else if (strEventId === "blackberry.push.createChannel.callback") {
            _event.trigger("blackberry.push.createChannel.callback", JSON.parse(args));
        } else if (strEventId === "blackberry.push.destroyChannel.callback") {
            _event.trigger("blackberry.push.destroyChannel.callback", JSON.parse(args));
        } else if (strEventId === "blackberry.push.launchApplicationOnPush.callback") {
            _event.trigger("blackberry.push.launchApplicationOnPush.callback", JSON.parse(args));
        }
    };

    self.m_id = "";

    self.init();
};

_push = new JNEXT.Push();
