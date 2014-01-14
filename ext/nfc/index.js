/*
 * Copyright 2013 Research In Motion Limited.
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

var nfc,
    _event = require("../../lib/event");

function sendResponse(result, success, successVal, fail, msg) {
    if (result._success) {
        success(successVal);
    } else {
        if (result.code) {
            fail(-1, msg + ", error: " + result.code);
        } else {
            fail(-1, msg + ", user passed invalid argument");
        }
    }
}

module.exports = {
    getSetting: function (success, fail, args) {
        args.setting = JSON.parse(decodeURIComponent(args.setting));

        var result = nfc.getInstance().getSetting(args);
        sendResponse(result, success, result.enabled, fail, "Failed to get setting");
    },

    setSetting: function (success, fail, args) {
        args.setting = JSON.parse(decodeURIComponent(args.setting));
        args.enable = JSON.parse(decodeURIComponent(args.enable));

        var result = nfc.getInstance().setSetting(args);
        sendResponse(result, success, undefined, fail, "Failed to set setting");
    },

    secure: {
        access: {
            openLogicalChannelDirect: function (success, fail, args) {
                args.seType = JSON.parse(decodeURIComponent(args.seType));
                args.aid = JSON.parse(decodeURIComponent(args.aid));
                args.fcpType = JSON.parse(decodeURIComponent(args.fcpType));

                args.aidStr = window.btoa(String.fromCharCode.apply(null, args.aid));
                args.aidLen = args.aid.byteLength;

                delete args.aid;

                var result = nfc.getInstance().openLogicalChannelDirect(args);
                sendResponse(result, success, {
                    "session": result.session,
                    "channel": result.channel,
                    "responseLen": result.responseLen
                }, fail, "Failed to open channel");
            },

            seChannelTransmitAPDU: function (success, fail, args) {
                args.channel = JSON.parse(decodeURIComponent(args.channel));
                args.apdu = JSON.parse(decodeURIComponent(args.apdu));

                args.apduStr = window.btoa(String.fromCharCode.apply(null, args.apdu));
                args.apduLen = args.apdu.byteLength;

                delete args.apdu;

                var result = nfc.getInstance().seChannelTransmitAPDU(args),
                    resArray = new Uint8Array(window.atob(result.response).split("").map(
                        function (c) {
                            return c.charCodeAt(0);
                        })
                    );
                sendResponse(result, success, {
                    "response": resArray,
                    "responseLen": result.responseLen
                }, fail, "Failed to transmit APDU");
            },

            seChannelCloseChannel: function (success, fail, args) {
                args.channel = JSON.parse(decodeURIComponent(args.channel));

                var result = nfc.getInstance().seChannelCloseChannel(args);
                sendResponse(result, success, undefined, fail, "Failed to close channel");
            },

            seSessionCloseSession: function (success, fail, args) {
                args.session = JSON.parse(decodeURIComponent(args.session));

                var result = nfc.getInstance().seSessionCloseSession(args);
                sendResponse(result, success, undefined, fail, "Failed to close session");
            },

            seSessionGetATR: function (success, fail, args) {
                args.session = JSON.parse(decodeURIComponent(args.session));

                var result = nfc.getInstance().seSessionGetATR(args),
                    atr = result._success ? new Uint8Array(window.atob(result.atr).split("").map(
                        function (c) {
                            return c.charCodeAt(0);
                        })
                    ) : undefined;
                sendResponse(result, success, atr, fail, "Failed to retrieve ATR");
            },

            seChannelIsClosed: function (success, fail, args) {
                args.channel = JSON.parse(decodeURIComponent(args.channel));

                var result = nfc.getInstance().seChannelIsClosed(args);
                sendResponse(result, success, result.isClosed, fail, "Failed to determine if channel is closed");
            },

            seChannelGetSession: function (success, fail, args) {
                args.channel = JSON.parse(decodeURIComponent(args.channel));

                var result = nfc.getInstance().seChannelGetSession(args);
                sendResponse(result, success, result.session, fail, "Failed to get session");
            },

            seChannelIsBasicChannel: function (success, fail, args) {
                args.channel = JSON.parse(decodeURIComponent(args.channel));

                var result = nfc.getInstance().seChannelIsBasicChannel(args);
                sendResponse(result, success, result.isBasicChannel, fail, "Failed to determine if channel is basic channel");
            },

            seEnableSWP: function (success, fail, args) {
                var result = nfc.getInstance().seEnableSWP();
                sendResponse(result, success, undefined, fail, "Failed to initiate the activation of SWP");
            },

            seGetActiveSEType: function (success, fail, args) {
                var result = nfc.getInstance().seGetActiveSEType();
                sendResponse(result, success, undefined, fail, "Failed to obtain the type of secure element");
            },

            seServiceGetReaders: function (success, fail, args) {
                var result = nfc.getInstance().seServiceGetReaders();
                sendResponse(result, success, {
                    "readers": result.readers,
                    "numReaders": result.numReaders
                }, fail, "Failed to get readers");
            },

            seReaderIsSecureElementPresent: function (success, fail, args) {
                args.reader = JSON.parse(decodeURIComponent(args.reader));

                var result = nfc.getInstance().seReaderIsSecureElementPresent(args);
                sendResponse(result, success, result.isPresent, fail, "Failed to determine if secure element is present");
            },

            seReaderOpenSession: function (success, fail, args) {
                args.reader = JSON.parse(decodeURIComponent(args.reader));

                var result = nfc.getInstance().seReaderOpenSession(args);
                sendResponse(result, success, result.session, fail, "Failed to open session");
            },

            seReaderCloseSessions: function (success, fail, args) {
                args.reader = JSON.parse(decodeURIComponent(args.reader));

                var result = nfc.getInstance().seReaderCloseSessions(args);
                sendResponse(result, success, undefined, fail, "Failed to close sessions");
            },

            seReaderGetName: function (success, fail, args) {
                args.reader = JSON.parse(decodeURIComponent(args.reader));

                var result = nfc.getInstance().seReaderGetName(args);
                sendResponse(result, success, result.readerName, fail, "Failed to get reader name");
            },

            seSessionOpenLogicalChannel: function (success, fail, args) {
                args.session = JSON.parse(decodeURIComponent(args.session));
                args.aid = JSON.parse(decodeURIComponent(args.aid));
                args.fcpType = JSON.parse(decodeURIComponent(args.fcpType));

                args.aidStr = window.btoa(String.fromCharCode.apply(null, args.aid));
                args.aidLen = args.aid.byteLength;

                delete args.aid;

                var result = nfc.getInstance().seSessionOpenLogicalChannel(args),
                    resArray = new Uint8Array(window.atob(result.response).split("").map(
                        function (c) {
                            return c.charCodeAt(0);
                        })
                    );
                sendResponse(result, success, {
                    "channel": result.channel,
                    "response": resArray,
                    "responseLen": result.responseLen
                }, fail, "Failed to get open channel");
            },

            seSessionCloseChannels: function (success, fail, args) {
                args.session = JSON.parse(decodeURIComponent(args.session));

                var result = nfc.getInstance().seSessionCloseChannels(args);
                sendResponse(result, success, undefined, fail, "Failed to close channels");
            },

            seSessionIsSessionClosed: function (success, fail, args) {
                args.session = JSON.parse(decodeURIComponent(args.session));

                var result = nfc.getInstance().seSessionIsSessionClosed(args);
                sendResponse(result, success, result.isClosed, fail, "Failed to check if session is closed");
            },

            seSessionGetReader: function (success, fail, args) {
                args.session = JSON.parse(decodeURIComponent(args.session));

                var result = nfc.getInstance().seSessionGetReader(args);
                sendResponse(result, success, result.reader, fail, "Failed to retrieve reader");
            },

            seSessionOpenBasicChannel: function (success, fail, args) {
                args.session = JSON.parse(decodeURIComponent(args.session));
                args.fcpType = JSON.parse(decodeURIComponent(args.fcpType));

                var result = nfc.getInstance().seSessionOpenBasicChannel(args),
                    resArray = new Uint8Array(window.atob(result.response).split("").map(
                        function (c) {
                            return c.charCodeAt(0);
                        })
                    );

                sendResponse(result, success, {
                    "channel": result.channel,
                    "response": resArray,
                    "responseLen": result.responseLen
                }, fail, "Failed to open channel");
            },

            seReaderGetTechnologyTypes: function (success, fail, args) {
                args.session = JSON.parse(decodeURIComponent(args.session));
                args.batteryMode = JSON.parse(decodeURIComponent(args.batteryMode));

                var result = nfc.getInstance().seReaderGetTechnologyTypes(args);
                sendResponse(result, success, result.technologyTypes, fail, "Failed to get technology types");
            },

            seReaderSetTechnologyTypes: function (success, fail, args) {
                args.session = JSON.parse(decodeURIComponent(args.session));
                args.technologyTypes = JSON.parse(decodeURIComponent(args.technologyTypes));

                var result = nfc.getInstance().seReaderSetTechnologyTypes(args);
                sendResponse(result, success, undefined, fail, "Failed to set technology types");
            },

            seSetUICCActive: function (success, fail, args) {
                args._eventId = JSON.parse(decodeURIComponent(args._eventId));

                var result = nfc.getInstance().seSetUICCActive(args);
                sendResponse(result, success, undefined, fail, "Failed to initiate the process of setting the UICC as the active secure element");
            }
        },

        transaction: {
            seParseTransaction: function (success, fail, args) {
                args.data = JSON.parse(decodeURIComponent(args.data));

                var result = nfc.getInstance().seParseTransaction(args);
                sendResponse(result, success, result.transaction, fail, "Failed to parse transaction");
            },

            seTransactionGetSEType: function (success, fail, args) {
                args.transaction = JSON.parse(decodeURIComponent(args.transaction));

                var result = nfc.getInstance().seTransactionGetSEType(args);
                sendResponse(result, success, result.seType, fail, "Failed to get SE type");
            },

            seTransactionGetProtocol: function (success, fail, args) {
                args.transaction = JSON.parse(decodeURIComponent(args.transaction));

                var result = nfc.getInstance().seTransactionGetProtocol(args);
                sendResponse(result, success, result.technologyType, fail, "Failed to get protocol");
            },

            seFreeTransaction: function (success, fail, args) {
                args.transaction = JSON.parse(decodeURIComponent(args.transaction));

                var result = nfc.getInstance().seFreeTransaction(args);
                sendResponse(result, success, undefined, fail, "Failed to free transaction");
            },

            seTransactionForegroundApplication: function (success, fail, args) {
                var result = nfc.getInstance().seTransactionForegroundApplication();
                sendResponse(result, success, undefined, fail, "Failed to bring application to foreground");
            },

            seTransactionGetNumberOfAIDs: function (success, fail, args) {
                args.transaction = JSON.parse(decodeURIComponent(args.transaction));

                var result = nfc.getInstance().seTransactionGetNumberOfAIDs(args);
                sendResponse(result, success, result.numAIDs, fail, "Failed to get number of AIDs");
            },

            seTransactionGetAID: function (success, fail, args) {
                args.transaction = JSON.parse(decodeURIComponent(args.transaction));
                args.index = JSON.parse(decodeURIComponent(args.index));

                var result = nfc.getInstance().seTransactionGetAID(args),
                    aid = result._success ? new Uint8Array(window.atob(result.aid).split("").map(
                        function (c) {
                            return c.charCodeAt(0);
                        }
                    )) : undefined;

                sendResponse(result, success, {
                    "aid": aid,
                    "aidLen": result.aidLength
                }, fail, "Failed to get AID");
            },

            seTransactionGetEventDataLength: function (success, fail, args) {
                args.transaction = JSON.parse(decodeURIComponent(args.transaction));

                var result = nfc.getInstance().seTransactionGetEventDataLength(args);
                sendResponse(result, success, result.eventDataLen, fail, "Failed to get event data length");
            },

            seTransactionGetEventData: function (success, fail, args) {
                args.transaction = JSON.parse(decodeURIComponent(args.transaction));

                var result = nfc.getInstance().seTransactionGetEventData(args),
                    eventData = result._success ? new Uint8Array(window.atob(result.eventData).split("").map(
                        function (c) {
                            return c.charCodeAt(0);
                        }
                    )) : undefined;

                sendResponse(result, success, eventData, fail, "Failed to get event data length");
            }
        }
    }
};

///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT plugin
///////////////////////////////////////////////////////////////////

JNEXT.Nfc = function ()
{
    var self = this,
        hasInstance = false;

    self.getSetting = function (args) {
        var value = JNEXT.invoke(self.m_id, "getSetting " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.setSetting = function (args) {
        var value = JNEXT.invoke(self.m_id, "setSetting " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.openLogicalChannelDirect = function (args) {
        var value = JNEXT.invoke(self.m_id, "openLogicalChannelDirect " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seChannelTransmitAPDU = function (args) {
        var value = JNEXT.invoke(self.m_id, "seChannelTransmitAPDU " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seChannelCloseChannel = function (args) {
        var value = JNEXT.invoke(self.m_id, "seChannelCloseChannel " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seSessionCloseSession = function (args) {
        var value = JNEXT.invoke(self.m_id, "seSessionCloseSession " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seChannelIsClosed = function (args) {
        var value = JNEXT.invoke(self.m_id, "seChannelIsClosed " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seChannelGetSession = function (args) {
        var value = JNEXT.invoke(self.m_id, "seChannelGetSession " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seChannelIsBasicChannel = function (args) {
        var value = JNEXT.invoke(self.m_id, "seChannelIsBasicChannel " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seEnableSWP = function () {
        var value = JNEXT.invoke(self.m_id, "seEnableSWP");
        return JSON.parse(value);
    };

    self.seGetActiveSEType = function () {
        var value = JNEXT.invoke(self.m_id, "seGetActiveSEType");
        return JSON.parse(value);
    };

    self.seServiceGetNumReaders = function () {
        var value = JNEXT.invoke(self.m_id, "seServiceGetNumReaders");
        return JSON.parse(value);
    };

    self.seServiceGetReaders = function () {
        var value = JNEXT.invoke(self.m_id, "seServiceGetReaders");
        return JSON.parse(value);
    };

    self.seReaderIsSecureElementPresent = function (args) {
        var value = JNEXT.invoke(self.m_id, "seReaderIsSecureElementPresent " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seReaderOpenSession = function (args) {
        var value = JNEXT.invoke(self.m_id, "seReaderOpenSession " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seReaderCloseSessions = function (args) {
        var value = JNEXT.invoke(self.m_id, "seReaderCloseSessions " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seReaderGetName = function (args) {
        var value = JNEXT.invoke(self.m_id, "seReaderGetName " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seSessionOpenLogicalChannel = function (args) {
        var value = JNEXT.invoke(self.m_id, "seSessionOpenLogicalChannel " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seSessionCloseChannels = function (args) {
        var value = JNEXT.invoke(self.m_id, "seSessionCloseChannels " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seSessionIsSessionClosed = function (args) {
        var value = JNEXT.invoke(self.m_id, "seSessionIsSessionClosed " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seSessionGetATR = function (args) {
        var value = JNEXT.invoke(self.m_id, "seSessionGetATR " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seSessionGetReader = function (args) {
        var value = JNEXT.invoke(self.m_id, "seSessionGetReader " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seSessionOpenBasicChannel = function (args) {
        var value = JNEXT.invoke(self.m_id, "seSessionOpenBasicChannel " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seSetUICCActive = function (args) {
        var value = JNEXT.invoke(self.m_id, "seSetUICCActive " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seReaderGetTechnologyTypes = function (args) {
        var value = JNEXT.invoke(self.m_id, "seReaderGetTechnologyTypes " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seReaderSetTechnologyTypes = function (args) {
        var value = JNEXT.invoke(self.m_id, "seReaderSetTechnologyTypes " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seParseTransaction = function (args) {
        var value = JNEXT.invoke(self.m_id, "seParseTransaction " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seTransactionGetSEType = function (args) {
        var value = JNEXT.invoke(self.m_id, "seTransactionGetSEType " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seTransactionGetProtocol = function (args) {
        var value = JNEXT.invoke(self.m_id, "seTransactionGetProtocol " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seFreeTransaction = function (args) {
        var value = JNEXT.invoke(self.m_id, "seFreeTransaction " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seTransactionForegroundApplication = function () {
        var value = JNEXT.invoke(self.m_id, "seTransactionForegroundApplication");
        return JSON.parse(value);
    };

    self.seTransactionGetNumberOfAIDs = function (args) {
        var value = JNEXT.invoke(self.m_id, "seTransactionGetNumberOfAIDs " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seTransactionGetAID = function (args) {
        var value = JNEXT.invoke(self.m_id, "seTransactionGetAID " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seTransactionGetEventDataLength = function (args) {
        var value = JNEXT.invoke(self.m_id, "seTransactionGetEventDataLength " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.seTransactionGetEventData = function (args) {
        var value = JNEXT.invoke(self.m_id, "seTransactionGetEventData " + JSON.stringify(args));
        return JSON.parse(value);
    };

    self.getId = function () {
        return self.m_id;
    };

    self.init = function () {
        if (!JNEXT.require("libnfcww")) {
            return false;
        }

        self.m_id = JNEXT.createObject("libnfcww.Nfc");

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

    self.m_id = "";

    self.getInstance = function () {
        if (!hasInstance) {
            self.init();
            hasInstance = true;
        }
        return self;
    };
};

nfc = new JNEXT.Nfc();
