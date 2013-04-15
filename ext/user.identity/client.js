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
    IDS_FAILURE = -1,  /*!< Indicates that a function did not complete
                            successfully.  Often the application can get
                            additional information by checking the value of
                            @c errno. */
    IDS_SUCCESS = 0,   /*!< Indicates that a function completed successfully.
                            In asynchronous calls, the request has been sent
                            and either the success or failure callback will be
                            called when the response arrives. */

    IDS_DEFAULT_ERROR = 49999, /*!< Default error.  Internal error occurred
                                    while processing the request. */

    // BlackBerry ID library basic error codes (reserved range : 50000 - 50099)
    IDS_NAME_TOO_LONG = 50002,
    IDS_ACCOUNT_LOCALLY_LOCKED_OUT = 50003,
    IDS_USER_COULD_NOT_BE_AUTHENTICATED = 50004,
    IDS_TOO_MANY_NAMES_PASSED = 50005,
    IDS_INVALID_REQUEST = 50006,
    IDS_PROPERTY_DOES_NOT_EXIST = 50007,
    IDS_UNKNOWN_TOKEN_TYPE = 50008,
    IDS_UNKNOWN_APPLIES_TO = 50009,
    IDS_NOT_ENOUGH_RESOURCES = 50010,
    IDS_CANNOT_GET_TOKEN_WHILE_OFFLINE = 50011,
    IDS_ERROR_WHILE_CONTACTING_SERVICE = 50012,  /*!< Error while contacting
                                                      identity service.  This
                                                      could include network
                                                      issues. */
    IDS_NULL_OR_UNKNOWN_PARAMETERS = 50015,
    IDS_CLEAR_TOKEN_FAIL = 50016,
    IDS_PROPERTY_NOT_AUTHORIZED = 50017,
    IDS_NAME_MUST_BE_SET = 50107,

    // Profile Service error codes (reserved range : 50100 - 50199)
    IDS_BAD_PROPERTY_NAME = 50100,
    IDS_PROPERTY_VALUE_TOO_LARGE = 50107,
    IDS_CREATE_FAIL = 50152,
    IDS_GET_FAIL = 50153,
    IDS_SET_FAIL = 50154,
    IDS_DELETE_FAIL = 50155,
    IDS_PROFILE_SERVER_ERROR = 50158,
    IDS_EXISTING_PROPERTY = 50159,
    IDS_NON_EXISTING_PROPERTY = 50160,
    IDS_GET_PROPERTY_FAIL = 50161,
    IDS_SET_PROPERTY_FAIL = 50162

_self.self = {};

_self.getVersion = function () {
	return window.webworks.execSync(_ID, "getVersion", null);
};

_self.registerProvider = function (provider) {
    var args = {
            "provider": provider || {}
        },
	obj = JSON.parse(window.webworks.execSync(_ID, "registerProvider", args));
	return obj;
};

_self.setOption = function (option, value) {
	var args = {
			"option": option,
			"value": value || {}
		},
	obj = JSON.parse(window.webworks.execSync(_ID, "setOption", args));
	return obj;
};


function createEventHandler(_eventId, callback) {
    if (!window.webworks.event.isOn(_eventId)) {
		window.webworks.event.once(_ID, _eventId, callback);
	}
}

_self.getToken = function (idsProvider, tokenType, appliesTo, successCallback, failureCallback) {
	var _eventId = "bbidGetTokenEventId" + tokenType + appliesTo,
		args = {
			"_eventId": _eventId,
			"provider": idsProvider,
			"tokenType": tokenType,
			"appliesTo": appliesTo || {}
        };

	createEventHandler(_eventId, function (args) {
		var resultJSON = JSON.parse(args);
	
		if (resultJSON.result) {
			failureCallback(resultJSON);
		} else {
			successCallback(resultJSON);
		}
	});

	window.webworks.execAsync(_ID, "getToken", args);
};


_self.clearToken = function (idsProvider, tokenType, appliesTo, successCallback, failureCallback) {
	var _eventId = "bbidClearTokenEventId" + tokenType + appliesTo,
		args = {
			"_eventId": _eventId,
			"provider": idsProvider,
			"tokenType": tokenType,
			"appliesTo": appliesTo || {}
        };

	createEventHandler(_eventId, function (args) {
		var resultJSON = JSON.parse(args);
	
		if (resultJSON.result) {
			failureCallback(resultJSON);
		} else {
			successCallback(resultJSON);
		}
	});
	
	window.webworks.execAsync(_ID, "clearToken", args);
};

_self.getProperties = function (idsProvider, propertyType, userProperties, successCallback, failureCallback) {
	var _eventId = "bbidGetPropertiesEventId" + userProperties,
		args = {
			"_eventId": _eventId,
			"provider": idsProvider,
			"propertyType": propertyType,
			"userProperties": userProperties || {}
        };

	createEventHandler(_eventId, function (args) {
		var resultJSON = JSON.parse(args);
	
		if (resultJSON.result) {
			failureCallback(resultJSON);
		} else {
			successCallback(resultJSON.userProperties);
		}
	});

	window.webworks.execAsync(_ID, "getProperties", args);
};

_self.createProperty = function (idsProvider, propertyType, propertyName, propertyValue, successCallback, failureCallback) {
	var _eventId = "bbidCreatePropertyEventId" + propertyName + propertyValue,
		args = {
			"_eventId": _eventId,
			"provider": idsProvider,
			"propertyType": propertyType,
			"propertyName": propertyName,
			"propertyValue": propertyValue || {}
        };

	createEventHandler(_eventId, function (args) {
		var resultJSON = JSON.parse(args);
	
		if (resultJSON.result) {
			failureCallback(resultJSON);
		} else {
			successCallback();
		}
	});

	window.webworks.execAsync(_ID, "createProperty", args);
};

_self.setProperty = function (idsProvider, propertyType, propertyName, propertyValue, successCallback, failureCallback) {
	var _eventId = "bbidSetPropertyEventId" + propertyName + propertyValue,
		args = {
			"_eventId": _eventId,
			"provider": idsProvider,
			"propertyType": propertyType,
			"propertyName": propertyName,
			"propertyValue": propertyValue || {}
        };

	createEventHandler(_eventId, function (args) {
		var resultJSON = JSON.parse(args);
	
		if (resultJSON.result) {
			failureCallback(resultJSON);
		} else {
			successCallback();
		}
	});

	window.webworks.execAsync(_ID, "setProperty", args);
};

_self.deleteProperty = function (idsProvider, propertyType, propertyName, successCallback, failureCallback) {
	var _eventId = "bbidDeletePropertyEventId" + propertyName,
		args = {
			"_eventId": _eventId,
			"provider": idsProvider,
			"propertyType": propertyType,
			"propertyName": propertyName || {}
        };

	createEventHandler(_eventId, function (args) {
		var resultJSON = JSON.parse(args);
	
		if (resultJSON.result) {
			failureCallback(resultJSON);
		} else {
			successCallback();
		}
	});

	window.webworks.execAsync(_ID, "deleteProperty", args);
};

_self.deleteLocalProperty = function (idsProvider, propertyType, propertyName, successCallback, failureCallback) {
	var _eventId = "bbidDeleteLocalPropertyEventId" + propertyName,
		args = {
			"_eventId": _eventId,
			"provider": idsProvider,
			"propertyType": propertyType,
			"propertyName": propertyName || {}
        };

	createEventHandler(_eventId, function (args) {
		var resultJSON = JSON.parse(args);
	
		if (resultJSON.result) {
			failureCallback(resultJSON);
		} else {
			successCallback();
		}
	});

	window.webworks.execAsync(_ID, "deleteLocalProperty", args);
};


module.exports = _self;

