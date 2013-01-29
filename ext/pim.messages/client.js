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
var _self = {},
    _ID = require("./manifest.json").namespace,
    _utils = require("./../../lib/utils"),
    Message = require("./Message"),
    MessageAccount = require("./MessageAccount"),
    MessageAddress = require("./MessageAddress"),
    MessageAttachment = require("./MessageAttachment"),
    MessageFolder = require("./MessageFolder"),
    MessageFindOptions = require("./MessageFindOptions"),
    MessageFindFilter = require("./MessageFindFilter"),
    MessageError = require("./MessageError");

_self.create = function (account) {
    var props = {},
        defaultAccount;

    if (!account) {
        defaultAccount = new window.webworks.execSync(_ID, "getDefaultAccount");
        account = new MessageAccount(defaultAccount);
    }
    else if (!(account instanceof MessageAccount)) {
        throw new MessageError(MessageError.INVALID_ARGUMENT_ERROR);
    }

    props.id = null;
    props.account = account;

    return new Message(props);
};

_self.getMessageAccounts = function () {
    var obj = window.webworks.execSync(_ID, "getAccounts"),
        accounts = [];
        
    obj.forEach(function (account) {
        accounts.push(new MessageAccount(account));
    });

    return accounts;
};

_self.getDefaultMessageAccount = function () {
    var defaultAccount = window.webworks.execSync(_ID, "getDefaultAccount");

    return new MessageAccount(defaultAccount);
};


_self.getMessage = function (account, id) {
    var message;

    if (!(account && account instanceof MessageAccount)) {
        throw new MessageError(MessageError.INVALID_ARGUMENT_ERROR);
    }

    message = window.webworks.execSync(_ID, "getMessage", {'accountId': account.id, 'messageId': "" + id});

    if (!message) {
        return null;
    }

    return new Message(message);
};

_self.find = function (messageFields, findOptions, onSuccess, onError) {
    var request,
        account,
        messages,
        callback;

    if (onSuccess && typeof onSuccess === "function") {
        callback = function (args) {
            var result = JSON.parse(unescape(args.result));

            if (result._success) {
                if (onSuccess && typeof onSuccess === "function") {
                    // Result is an array where each item contains account and the array of messages belongs to it
                    result.items.forEach(function (item) {
                        account = new MessageAccount(item.account);
                        item.messages.forEach(function (message) {
                            message.account = account;
                            messages.push(new Message(message));
                        });
                    });

                    onSuccess(messages);
                }
            } else {
                if (onError && typeof onError === "function") {
                    onError(new MessageError(result.errorCode));
                }
            }
        };

        request = {
            '_eventId': _utils.guid(),
            'fields': messageFields,
            'options': (findOptions instanceof MessageFindOptions ? findOptions.getJSON() : findOptions)
        };

        if (!window.webworks.event.isOn(request._eventId)) {
            window.webworks.event.once(_ID, request._eventId, callback);
        }

        window.webworks.execAsync(_ID, "findMessages", request);
    }
    else {
        onError(new MessageError(MessageError.INVALID_ARGUMENT_ERROR));
    }
};

_self.Message = Message;
_self.MessageAccount = MessageAccount;
_self.MessageAddress = MessageAddress;
_self.MessageAttachment = MessageAttachment;
_self.MessageFolder = MessageFolder;
_self.MessageFindOptions = MessageFindOptions;
_self.MessageFindFilter = MessageFindFilter;
_self.MessageError = MessageError;

module.exports = _self;
