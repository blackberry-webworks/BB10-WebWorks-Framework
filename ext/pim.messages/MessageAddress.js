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
var MessageAddress;

MessageAddress = function (type, displayName, email, id) {
    var that = this;

    this.type = type;
    this.displayName = displayName;
    this.email = email;

    this.getJSON = function () {
        return {
            'id': id || "",
            'type': that.type,
            'displayName': that.displayName,
            'email': that.email,
        };
    };
};

MessageAddress.getArrayOfObjectsFromArrayOfJSONs = function (adresses) {
    var objectsArray = [];

    if (adresses) {
        adresses.forEach(function (address) {
            objectsArray.push(new MessageAddress(address.type, address.displayName, address.email, address.id));
        });
    }

    return objectsArray;
};

MessageAddress.getArrayOfJSONsFromArrayOfObjects = function (adresses) {
    var jsonsArray = [];

    if (adresses) {
        adresses.forEach(function (address) {
            jsonsArray.push(address.getJSON());
        });
    }

    return jsonsArray;
};

Object.defineProperty(MessageAddress, "TO", {"value": 0});
Object.defineProperty(MessageAddress, "CC", {"value": 1});
Object.defineProperty(MessageAddress, "BCC", {"value": 2});
Object.defineProperty(MessageAddress, "FROM", {"value": 3});
Object.defineProperty(MessageAddress, "REPLY_TO", {"value": 4});

module.exports = MessageAddress;
