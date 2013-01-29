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
var MessageError = function (code) {
    this.code = code;
};

Object.defineProperty(MessageError, "UNKNOWN_ERROR", { "value": 0 });
Object.defineProperty(MessageError, "INVALID_ARGUMENT_ERROR", { "value": 1 });
Object.defineProperty(MessageError, "TIMEOUT_ERROR", { "value": 2 });
Object.defineProperty(MessageError, "PENDING_OPERATION_ERROR", { "value": 3 });
Object.defineProperty(MessageError, "IO_ERROR", { "value": 4 });
Object.defineProperty(MessageError, "NOT_SUPPORTED_ERROR", { "value": 5 });
Object.defineProperty(MessageError, "PERMISSION_DENIED_ERROR", { "value": 20 });

Object.defineProperty(MessageError, "SAVE_MESSAGE_BEFORE_ATTACHMENT", { "value": 21 });

module.exports = MessageError;

