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
var _ID = require("./manifest.json").namespace,
    _utils = require("./../../lib/utils"),
    MessageAttachment,
    MessageFolder = require("./MessageFolder"),
    MessageError = require("./MessageError");

MessageAttachment = function (args) {
    args = args || {};
    this.name = args.name;
    this.mimeType = args.mimeType;

    this.getJSON = function () {
        return {
            'id': args.id,
            'messageId': args.messageId,
            'accountId': args.accountId,
            'filePath': args.filePath,
            'name': this.name,
            'mimeType': this.mimeType
        };
    };

    this.save = function (filePath, onSuccess, onError) {
        var request,
            callback;

        if (!(args.messageId && args.messageId.length > 0)) {
            if (onError && typeof onError === "function") {
                onError(new MessageError(MessageError.SAVE_MESSAGE_BEFORE_ATTACHMENT));
            }
        }

        request = this.getJSON();

        if ((onSuccess && typeof onSuccess === "function") || (onError && typeof onError === "function")) {
            request._eventId = _utils.guid();
            callback = function (args) {
                var result = JSON.parse(unescape(args.result));

                if (result._success) {
                    args.id = result.id;
                    args.filePath = filePath;

                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess();
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(new MessageError(result.errorCode));
                    }
                }
            };

            if (!window.webworks.event.isOn(request._eventId)) {
                window.webworks.event.once(_ID, request._eventId, callback);
            }
        }

        window.webworks.execAsync(_ID, "saveAttachment", request);
    };
};

MessageAttachment.getArrayOfObjectsFromArrayOfJSONs = function (attachments) {
    var objectsArray = [];

    if (attachments) {
        attachments.forEach(function (attachment) {
            objectsArray.push(new MessageAttachment(attachment));
        });
    }

    return objectsArray;
};

MessageAttachment.getArrayOfJSONsFromArrayOfObjects = function (attachments) {
    var jsonsArray = [];

    if (attachments) {
        attachments.forEach(function (attachment) {
            jsonsArray.push(attachment.getJSON());
        });
    }

    return jsonsArray;
};

module.exports = MessageAttachment;