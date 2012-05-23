/*
 * Copyright 2010-2011 Research In Motion Limited.
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
    if (/^lib/.test(id)) {
        return !!require.resolve ? require("../../" + id) : window.require(id);
    } else if (/^ext/.test(id)) {
        var idParts = id.split("/"),
            nodePath;
        idParts.splice(0, 1);
        nodePath = "../" + idParts.join("/");
        return !!require.resolve ? require(nodePath) : window.require(id);
    }
}

var _config = requireLocal("lib/config"),
    _event = requireLocal("lib/event"),
    _eventExt = requireLocal("ext/blackberry.event/index"),
    _actionMap = {
        pause: {
            context: require("./navEvents"),
            event: "pause",
            trigger: function () {
                _event.trigger("pause");
            }
        },
        resume: {
            context: require("./navEvents"),
            event: "resume",
            trigger: function () {
                _event.trigger("resume");
            }
        }
    };

module.exports = {
    registerEvents: function (success, fail, args, env) {
        try {
            _eventExt.registerEvents(_actionMap);
            success();
        } catch (e) {
            fail(-1, e);
        }
    },

    showDialog: function (success, fail, args, env) {
        var controller = window.qnx.webplatform.getController(),
            dialogCallback = function (returnVal) {
                console.log("ui.dialog.completed fired");
                return returnVal ? success(returnVal) : fail();
            };        
        controller.dispatchEvent("ui.dialog", [], {webviewId: 2, callback: dialogCallback});
    }
};
