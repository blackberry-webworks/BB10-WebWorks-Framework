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


var ids,
    _event = require("../../lib/event");

///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT plugin
///////////////////////////////////////////////////////////////////

JNEXT.IDS = function ()
{
    var self = this;

    self.idsGetVersion = function (trigger) {
        return JNEXT.invoke(self.m_id, "getVersion");
    };

	self.idsRegisterProvider = function (args) {
		return JNEXT.invoke(self.m_id, "registerProvider " + args);
	};

	self.idsSetOption = function (args) {
        var setOptionsOpts = { "option" : JSON.parse(decodeURIComponent(args.option)),
                            "value" : JSON.parse(decodeURIComponent(args.value)) };

		if (typeof(setOptionsOpts.option) === "string") {
			setOptionsOpts.option = parseInt(setOptionsOpts.option, 10);
		} else if (typeof(setOptionsOpts.option) !== "number") {
			setOptionsOpts.option = -1;
		}
		
		return JNEXT.invoke(self.m_id, "setOption " + JSON.stringify(setOptionsOpts));
	};

	self.idsGetToken = function (args) {
		var getTokenArgs = { "_eventId" : JSON.parse(decodeURIComponent(args._eventId)),
							"provider" : JSON.parse(decodeURIComponent(args.provider)),
							"tokenType" : JSON.parse(decodeURIComponent(args.tokenType)),
							"appliesTo" : JSON.parse(decodeURIComponent(args.appliesTo)) };

		if (typeof(getTokenArgs.provider) !== "string") {
			getTokenArgs.provider = "";
		}
		if (typeof(getTokenArgs.tokenType) !== "string") {
			getTokenArgs.tokenType = "";
		}
		if (typeof(getTokenArgs.appliesTo) !== "string") {
			getTokenArgs.appliesTo = "";
		}
		return JNEXT.invoke(self.m_id, "getToken " + JSON.stringify(getTokenArgs));
	};

	self.idsClearToken = function (args) {
        var clearTokenArgs = { "_eventId" : JSON.parse(decodeURIComponent(args._eventId)),
							"provider" : JSON.parse(decodeURIComponent(args.provider)),
							"tokenType" : JSON.parse(decodeURIComponent(args.tokenType)),
							"appliesTo" : JSON.parse(decodeURIComponent(args.appliesTo)) };

		if (typeof(clearTokenArgs.provider) !== "string") {
			clearTokenArgs.provider = "";
		}
		if (typeof(clearTokenArgs.tokenType) !== "string") {
			clearTokenArgs.tokenType = "";
		}
		if (typeof(clearTokenArgs.appliesTo) !== "string") {
			clearTokenArgs.appliesTo = "";
		}

		return JNEXT.invoke(self.m_id, "clearToken " + JSON.stringify(clearTokenArgs));
	};

	self.idsGetProperties = function (args) {
        var getPropertiesArgs = { "_eventId" : JSON.parse(decodeURIComponent(args._eventId)),
								"provider" : JSON.parse(decodeURIComponent(args.provider)),
								"propertyType" : JSON.parse(decodeURIComponent(args.propertyType)),
								"numProps" : 0,
								"userProperties" : JSON.parse(decodeURIComponent(args.userProperties)) },
			properties = getPropertiesArgs.userProperties;

		if (typeof(getPropertiesArgs.propertyType) === "string") {
			getPropertiesArgs.propertyType = parseInt(getPropertiesArgs.propertyType, 10);
		} else if (typeof(getPropertiesArgs.propertyType) !== "number") {
			getPropertiesArgs.propertyType = -1;
		}

		if (typeof(getPropertiesArgs.provider) !== "string") {
			getPropertiesArgs.provider = "";
		}

		if (typeof(properties) === "string") {
			properties = properties.split(",");
			getPropertiesArgs.numProps = properties.length;
		} else {
			properties = "";
			getPropertiesArgs.userProperties = "";
			getPropertiesArgs.numProps = 0;
		}
		return JNEXT.invoke(self.m_id, "getProperties " + JSON.stringify(getPropertiesArgs));
	};

	self.idsCreateProperty = function (args) {
        var createPropertyArgs = { "_eventId" : JSON.parse(decodeURIComponent(args._eventId)),
									"provider" : JSON.parse(decodeURIComponent(args.provider)),
									"propertyType" : JSON.parse(decodeURIComponent(args.propertyType)),
									"propertyName" : JSON.parse(decodeURIComponent(args.propertyName)),
									"propertyValue" : JSON.parse(decodeURIComponent(args.propertyValue)) };

		if (typeof(createPropertyArgs.provider) !== "string") {
			createPropertyArgs.provider = "";
		}

		if (typeof(createPropertyArgs.propertyType) === "string") {
			createPropertyArgs.propertyType = parseInt(createPropertyArgs.propertyType, 10);
		} else if (typeof(createPropertyArgs.propertyType) !== "number") {
			createPropertyArgs.propertyType = -1;
		}
		
		if (typeof(createPropertyArgs.propertyName) !== "string") {
			createPropertyArgs.propertyName = "";
		}
		if (typeof(createPropertyArgs.propertyValue) !== "string") {
			createPropertyArgs.propertyValue = "";
		}
		return JNEXT.invoke(self.m_id, "createProperty " + JSON.stringify(createPropertyArgs));
	};

	self.idsSetProperty = function (args) {
        var setPropertyArgs = { "_eventId" : JSON.parse(decodeURIComponent(args._eventId)),
								"provider" : JSON.parse(decodeURIComponent(args.provider)),
								"propertyType" : JSON.parse(decodeURIComponent(args.propertyType)),
								"propertyName" : JSON.parse(decodeURIComponent(args.propertyName)),
								"propertyValue" : JSON.parse(decodeURIComponent(args.propertyValue)) };

		if (typeof(setPropertyArgs.provider) !== "string") {
			setPropertyArgs.provider = "";
		}
		if (typeof(setPropertyArgs.propertyType) === "string") {
			setPropertyArgs.propertyType = parseInt(setPropertyArgs.propertyType, 10);
		} else if (typeof(setPropertyArgs.propertyType) !== "number") {
			setPropertyArgs.propertyType = -1;
		}
		if (typeof(setPropertyArgs.propertyName) !== "string") {
			setPropertyArgs.propertyName = "";
		}
		if (typeof(setPropertyArgs.propertyValue) !== "string") {
			setPropertyArgs.propertyValue = "";
		}

		return JNEXT.invoke(self.m_id, "setProperty " + JSON.stringify(setPropertyArgs));
	};

	self.idsDeleteProperty = function (args) {
        var deletePropertyArgs = { "_eventId" : JSON.parse(decodeURIComponent(args._eventId)),
								"provider" : JSON.parse(decodeURIComponent(args.provider)),
								"propertyType" : JSON.parse(decodeURIComponent(args.propertyType)),
								"propertyName" : JSON.parse(decodeURIComponent(args.propertyName)) };

		if (typeof(deletePropertyArgs.provider) !== "string") {
			deletePropertyArgs.provider = "";
		}
		if (typeof(deletePropertyArgs.propertyType) === "string") {
			deletePropertyArgs.propertyType = parseInt(deletePropertyArgs.propertyType, 10);
		} else if (typeof(deletePropertyArgs.propertyType) !== "number") {
			deletePropertyArgs.propertyType = -1;
		}
		if (typeof(deletePropertyArgs.propertyName) !== "string") {
			deletePropertyArgs.propertyName = "";
		}

		return JNEXT.invoke(self.m_id, "deleteProperty " + JSON.stringify(deletePropertyArgs));
	};

	self.idsDeleteLocalProperty = function (args) {
        var deleteLocalPropertyArgs = { "_eventId" : JSON.parse(decodeURIComponent(args._eventId)),
										"provider" : JSON.parse(decodeURIComponent(args.provider)),
										"propertyType" : JSON.parse(decodeURIComponent(args.propertyType)),
										"propertyName" : JSON.parse(decodeURIComponent(args.propertyName)) };

		if (typeof(deleteLocalPropertyArgs.provider) !== "string") {
			deleteLocalPropertyArgs.provider = "";
		}
		if (typeof(deleteLocalPropertyArgs.propertyType) === "string") {
			deleteLocalPropertyArgs.propertyType = parseInt(deleteLocalPropertyArgs.propertyType, 10);
		} else if (typeof(deleteLocalPropertyArgs.propertyType) !== "number") {
			deleteLocalPropertyArgs.propertyType = -1;
		}
		if (typeof(deleteLocalPropertyArgs.propertyName) !== "string") {
			deleteLocalPropertyArgs.propertyName = "";
		}

		return JNEXT.invoke(self.m_id, "deleteLocalProperty " + JSON.stringify(deleteLocalPropertyArgs));
	};
	
    self.getId = function () {
        return self.m_id;
    };

	self.onEvent = function (strData) {
		var delim = strData.indexOf(" "),
			strEventDesc = strData.substring(0, delim),
			strEventData = strData.substring(delim + 1, strData.length);

		strEventDesc = strEventDesc.replace(/["']{1}/gi, "");
		_event.trigger(strEventDesc, strEventData);
	};
	
	self.init = function () {
        if (!JNEXT.require("libidsext")) {
            return false;
        }

        self.m_id = JNEXT.createObject("libidsext.IDSEXT");

        if (self.m_id === "") {
			return false;
        }

        JNEXT.registerEvents(self);
    };
	
    self.m_id = "";

    self.init();
};

ids = new JNEXT.IDS();

module.exports = {
	ids: ids
};