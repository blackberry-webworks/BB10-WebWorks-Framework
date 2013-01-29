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

var pimMessage,
    _event = require("../../lib/event"),
    MessageError = require("./MessageError"),
    INVALID_ID = "-1";

function getParsedArgs(args) {
    var parsedArgs = {},
        key;

    for (key in args) {
        if (args.hasOwnProperty(key)) {
            parsedArgs[key] = JSON.parse(decodeURIComponent(args[key]));
        }
    }

    return parsedArgs;
}

module.exports = {
    // MessageService.findAllMessagesForAccount - Temporoty for testing
    findAllMessagesForAccount: function (success, fail, args) {
        var parsedArgs = getParsedArgs(args);

        pimMessage.findAllMessagesForAccount(parsedArgs);
        success("");
    },

    // MessageService.find
    findMessages: function (success, fail, args) {
        var parsedArgs = getParsedArgs(args);

        pimMessage.findMessages(parsedArgs);
        success("");
    },

    // MessageService.getAccounts
    getAccounts: function (success, fail) {
        success(pimMessage.getAccounts());
    },

    // MessageService.getDefaultAccount
    getDefaultAccount: function (success, fail) {
        success(pimMessage.getDefaultAccount());
    },

    //MessageService.getMessage
    getMessage: function (success, fail, args) {
        var message = pimMessage.getMessage(getParsedArgs(args));

        if (!message || message.id === INVALID_ID) {
            message = null;
        }

        success(message);
    },

    // Message.save
    saveMessage: function (success, fail, args) {
        var parsedArgs = getParsedArgs(args);

        pimMessage.saveMessage(parsedArgs);
        success("");
    },

    // Message.send
    sendMessage: function (success, fail, args) {
        var parsedArgs = getParsedArgs(args);

        pimMessage.sendMessage(parsedArgs);
        success("");
    },

    // MessageAttachment.save
    saveAttachment: function (success, fail, args) {
        var parsedArgs = getParsedArgs(args);

        pimMessage.saveAttachment(parsedArgs);
        success("");
    }
};

///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT plugin
///////////////////////////////////////////////////////////////////

JNEXT.PimMessage = function ()
{
    var self = this;

    self.getId = function () {
        return self.m_id;
    };

    self.init = function () {
        if (!JNEXT.require("libpm")) {
            return false;
        }

        self.m_id = JNEXT.createObject("libpm.PimMessage");

        if (self.m_id === "") {
            return false;
        }

        JNEXT.registerEvents(self);
    };

    self.onEvent = function (strData) {
        var arData = strData.split(" "),
            strEventDesc = arData[0],
            args = {};

        if (strEventDesc === "result") {
            args.result = escape(strData.split(" ").slice(2).join(" "));
            _event.trigger(arData[1], args);
        }
    };

    self.dummyFunction = function () {
        JNEXT.invoke(self.m_id, "dummyFunction");
    };

    self.getAccounts = function () {
        var value = JNEXT.invoke(self.m_id, "getAccounts");
        return JSON.parse(value);
    };

    self.getDefaultAccount = function () {
        var value = JNEXT.invoke(self.m_id, "getDefaultAccount");
        return JSON.parse(value);
    };

    self.getMessage = function (args) {
        var value = JNEXT.invoke(self.m_id, "getMessage " + JSON.stringify(args));
        console.log("JNEXT value: " + value);
        return JSON.parse(value);
    };

    self.findAllMessagesForAccount = function (args) {
        JNEXT.invoke(self.m_id, "findAllMessagesForAccount " + JSON.stringify(args));
        return "";
    };

    self.findMessages = function (args) {
        JNEXT.invoke(self.m_id, "findMessages " + JSON.stringify(args));
        return "";
    };

    self.saveMessage = function (args) {
        JNEXT.invoke(self.m_id, "saveMessage " + JSON.stringify(args));
        return "";
    };

    self.sendMessage = function (args) {
        JNEXT.invoke(self.m_id, "sendMessage " + JSON.stringify(args));
        return "";
    };

    self.saveAttachment = function (args) {
        JNEXT.invoke(self.m_id, "saveAttachment " + JSON.stringify(args));
        return "";
    };

    self.m_id = "";

    self.init();
};

pimMessage = new JNEXT.PimMessage();
