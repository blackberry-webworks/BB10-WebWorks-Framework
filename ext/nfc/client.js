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

var _self = {},
    _ID = require("./manifest.json").namespace,
    utils = require("./../../lib/utils"),
    NFC_SETTING_ENABLED = 0,
    NFC_SETTING_CE_BACKLIGHT_OFF = 1,
    NFC_SETTING_CE_POWERED_OFF = 2,
    NFC_SETTING_PROMPT_TO_SEND_FILES = 3,
    FCP_OPEN_NO_FCP_INFO = 1,
    FCP_OPEN_FCP_WITH_REF_CLASS = 2,
    FCP_OPEN_FCP_WITH_REF_INTERFACE = 3,
    FCP_SATSA_OPEN_EMV_FCP = 4,
    SE_TYPE_SE_ID_NONE = 0,
    SE_TYPE_UICC_SE_ID = 1,
    SE_TYPE_EMBEDDED_SE_ID = 2,
    BATTERY_MODE_ON = 1,
    BATTERY_MODE_OFF = 2,
    TECHNOLOGY_TYPE_NONE = (0x0),
    TECHNOLOGY_TYPE_ISO14443A = (0x1 << 0),
    TECHNOLOGY_TYPE_ISO14443B = (0x1 << 1),
    TECHNOLOGY_TYPE_ISO14443B_PRIME = (0x1 << 2),
    TECHNOLOGY_TYPE_FELICA = (0x1 << 3),
    TECHNOLOGY_TYPE_ISO14443A_MIFARE = (0x1 << 4),
    TECHNOLOGY_TYPE_ISO15693 = (0x1 << 5);

_self.secure = {};
_self.secure.access = {};
_self.secure.transaction = {};

function validateSetting(setting) {
    return (setting === NFC_SETTING_ENABLED ||
        setting === NFC_SETTING_CE_BACKLIGHT_OFF ||
        setting === NFC_SETTING_CE_POWERED_OFF ||
        setting === NFC_SETTING_PROMPT_TO_SEND_FILES);
}

function validateSecureElementType(secureElementType) {
    return (secureElementType === SE_TYPE_UICC_SE_ID ||
        secureElementType === SE_TYPE_EMBEDDED_SE_ID);
}

function validateFcpResponseType(fcpResponseType) {
    return (fcpResponseType === FCP_OPEN_NO_FCP_INFO ||
        fcpResponseType === FCP_OPEN_FCP_WITH_REF_CLASS ||
        fcpResponseType === FCP_OPEN_FCP_WITH_REF_INTERFACE ||
        fcpResponseType === FCP_SATSA_OPEN_EMV_FCP);
}

function validateBatteryMode(batteryMode) {
    return (batteryMode === BATTERY_MODE_ON || batteryMode === BATTERY_MODE_OFF);
}

_self.getSetting = function (setting) {
    if (!validateSetting(setting)) {
        throw "Invalid setting";
    }

    var enabled = window.webworks.execSync(_ID, "getSetting", {
            "setting": setting
        });
    return enabled;
};

_self.setSetting = function (setting, enable) {
    if (!validateSetting(setting)) {
        throw "Invalid setting";
    }

    if (typeof enable !== "boolean") {
        throw "Invalid enable";
    }

    window.webworks.execSync(_ID, "setSetting", {
        "setting": setting,
        "enable": enable
    });
};

//////////////////////////////
// Access
//////////////////////////////

_self.secure.access.openLogicalChannelDirect = function (secureElementType, aid, fcpResponseType) {
    if (!validateSecureElementType(secureElementType)) {
        throw "Invalid secure element type";
    }

    if (!aid || !aid.byteLength) {
        throw "Invalid aid, must be a Uint8Aarray";
    }

    if (!validateFcpResponseType(fcpResponseType)) {
        throw "Invalid fcp response type";
    }

    var result = window.webworks.execSync(_ID, "secure/access/openLogicalChannelDirect", {
        "seType": secureElementType,
        "aid": aid,
        "fcpType": fcpResponseType
    });

    return result;
};

_self.secure.access.seChannelTransmitAPDU = function (channel, apdu) {
    if (typeof channel !== "number") {
        throw "Invalid channel";
    }

    if (!apdu || !apdu.byteLength) {
        throw "Invalid apdu, must be a Uint8Array";
    }

    var result = window.webworks.execSync(_ID, "secure/access/seChannelTransmitAPDU", {
        "channel": channel,
        "apdu": apdu
    });

    return result;
};

_self.secure.access.seChannelCloseChannel = function (channel) {
    if (typeof channel !== "number") {
        throw "Invalid channel";
    }

    window.webworks.execSync(_ID, "secure/access/seChannelCloseChannel", {
        "channel": channel
    });
};

_self.secure.access.seChannelIsClosed = function (channel) {
    if (typeof channel !== "number") {
        throw "Invalid channel";
    }

    return window.webworks.execSync(_ID, "secure/access/seChannelIsClosed", {
        "channel": channel
    });
};

_self.secure.access.seChannelGetSession = function (channel) {
    if (typeof channel !== "number") {
        throw "Invalid channel";
    }

    return window.webworks.execSync(_ID, "secure/access/seChannelGetSession", {
        "channel": channel
    });
};

_self.secure.access.seChannelIsBasicChannel = function (channel) {
    if (typeof channel !== "number") {
        throw "Invalid channel";
    }

    return window.webworks.execSync(_ID, "secure/access/seChannelIsBasicChannel", {
        "channel": channel
    });
};

_self.secure.access.seEnableSWP = function () {
    return window.webworks.execSync(_ID, "secure/access/seEnableSWP", null);
};

_self.secure.access.seGetActiveSEType = function () {
    return window.webworks.execSync(_ID, "secure/access/seGetActiveSEType", null);
};

_self.secure.access.seServiceGetReaders = function () {
    return window.webworks.execSync(_ID, "secure/access/seServiceGetReaders", null);
};

_self.secure.access.seReaderIsSecureElementPresent = function (reader) {
    if (typeof reader !== "number") {
        throw "Invalid reader";
    }

    return window.webworks.execSync(_ID, "secure/access/seReaderIsSecureElementPresent", {
        "reader": reader
    });
};

_self.secure.access.seReaderOpenSession = function (reader) {
    if (typeof reader !== "number") {
        throw "Invalid reader";
    }

    return window.webworks.execSync(_ID, "secure/access/seReaderOpenSession", {
        "reader": reader
    });
};

_self.secure.access.seReaderCloseSessions = function (reader) {
    if (typeof reader !== "number") {
        throw "Invalid reader";
    }

    window.webworks.execSync(_ID, "secure/access/seReaderCloseSessions", {
        "reader": reader
    });
};

_self.secure.access.seReaderGetName = function (reader) {
    if (typeof reader !== "number") {
        throw "Invalid reader";
    }

    return window.webworks.execSync(_ID, "secure/access/seReaderGetName", {
        "reader": reader
    });
};

_self.secure.access.seSessionOpenLogicalChannel = function (session, aid, fcpResponseType) {
    if (typeof session !== "number") {
        throw "Invalid session";
    }

    if (!aid || !aid.byteLength) {
        throw "Invalid aid, must be a Uint8Aarray";
    }

    if (!validateFcpResponseType(fcpResponseType)) {
        throw "Invalid fcp response type";
    }

    var result = window.webworks.execSync(_ID, "secure/access/seSessionOpenLogicalChannel", {
        "session": session,
        "aid": aid,
        "fcpType": fcpResponseType
    });

    return result;
};

_self.secure.access.seSessionOpenBasicChannel = function (session, fcpResponseType) {
    if (typeof session !== "number") {
        throw "Invalid session";
    }

    if (!validateFcpResponseType(fcpResponseType)) {
        throw "Invalid fcp response type";
    }

    var result = window.webworks.execSync(_ID, "secure/access/seSessionOpenBasicChannel", {
        "session": session,
        "fcpType": fcpResponseType
    });

    return result;
};

_self.secure.access.seSessionCloseChannels = function (session) {
    if (typeof session !== "number") {
        throw "Invalid session";
    }

    window.webworks.execSync(_ID, "secure/access/seSessionCloseChannels", {
        "session": session
    });
};

_self.secure.access.seSessionCloseSession = function (session) {
    if (typeof session !== "number") {
        throw "Invalid session";
    }

    window.webworks.execSync(_ID, "secure/access/seSessionCloseSession", {
        "session": session
    });
};

_self.secure.access.seSessionIsSessionClosed = function (session) {
    if (typeof session !== "number") {
        throw "Invalid session";
    }

    return window.webworks.execSync(_ID, "secure/access/seSessionIsSessionClosed", {
        "session": session
    });
};

_self.secure.access.seSessionGetReader = function (session) {
    if (typeof session !== "number") {
        throw "Invalid session";
    }

    return window.webworks.execSync(_ID, "secure/access/seSessionGetReader", {
        "session": session
    });
};

_self.secure.access.seReaderGetTechnologyTypes = function (session, batteryMode) {
    if (typeof session !== "number") {
        throw "Invalid session";
    }

    if (!validateBatteryMode(batteryMode)) {
        throw "Invalid battery mode";
    }

    return window.webworks.execSync(_ID, "secure/access/seReaderGetTechnologyTypes", {
        "session": session,
        "batteryMode": batteryMode
    });
};

_self.secure.access.seReaderSetTechnologyTypes = function (session, technologyTypes) {
    if (typeof session !== "number") {
        throw "Invalid session";
    }

    if (typeof technologyTypes !== "number") {
        throw "Invalid technology types";
    }

    window.webworks.execSync(_ID, "secure/access/seReaderSetTechnologyTypes", {
        "session": session,
        "technologyTypes": technologyTypes
    });
};

_self.secure.access.seSessionGetATR = function (session) {
    if (typeof session !== "number") {
        throw "Invalid session";
    }

    return window.webworks.execSync(_ID, "secure/access/seSessionGetATR", {
        "session": session
    });
};

_self.secure.access.seSetUICCActive = function (callback) {
    if (typeof callback !== "function") {
        throw "Invalid callback";
    }

    var eventId = utils.guid();

    window.webworks.event.once(_ID, eventId, callback);

    return window.webworks.execSync(_ID, "secure/access/seSetUICCActive", {
        "_eventId": eventId
    });
};

//////////////////////////////
// Transaction
//////////////////////////////

_self.secure.transaction.seParseTransaction = function (data) {
    // we will take JS object and stringify it?
    if (typeof data !== "object" ||
        !data.version ||
        !data.seType ||
        !data.aids ||
        !Array.isArray(data.aids)) {
        throw "Invalid data";
    }

    return window.webworks.execSync(_ID, "secure/transaction/seParseTransaction", {
        "data": JSON.stringify(data)
    });
};

_self.secure.transaction.seTransactionGetSEType = function (transaction) {
    if (typeof transaction !== "number") {
        throw "Invalid transaction";
    }

    return window.webworks.execSync(_ID, "secure/transaction/seTransactionGetSEType", {
        "transaction": transaction
    });
};

_self.secure.transaction.seTransactionGetProtocol = function (transaction) {
    if (typeof transaction !== "number") {
        throw "Invalid transaction";
    }

    return window.webworks.execSync(_ID, "secure/transaction/seTransactionGetProtocol", {
        "transaction": transaction
    });
};

_self.secure.transaction.seFreeTransaction = function (transaction) {
    if (typeof transaction !== "number") {
        throw "Invalid transaction";
    }

    window.webworks.execSync(_ID, "secure/transaction/seTransactionGetProtocol", {
        "transaction": transaction
    });
};

_self.secure.transaction.seTransactionForegroundApplication = function () {
    window.webworks.execSync(_ID, "secure/transaction/seTransactionForegroundApplication", null);
};

_self.secure.transaction.seTransactionGetNumberOfAIDs = function (transaction) {
    if (typeof transaction !== "number") {
        throw "Invalid transaction";
    }

    return window.webworks.execSync(_ID, "secure/transaction/seTransactionGetNumberOfAIDs", {
        "transaction": transaction
    });
};

_self.secure.transaction.seTransactionGetAID = function (transaction, index) {
    if (typeof transaction !== "number") {
        throw "Invalid transaction";
    }

    if (typeof index !== "number") {
        throw "Invalid index";
    }

    return window.webworks.execSync(_ID, "secure/transaction/seTransactionGetAID", {
        "transaction": transaction,
        "index": index
    });
};

_self.secure.transaction.seTransactionGetEventDataLength = function (transaction) {
    if (typeof transaction !== "number") {
        throw "Invalid transaction";
    }

    return window.webworks.execSync(_ID, "secure/transaction/seTransactionGetEventDataLength", {
        "transaction": transaction
    });
};

_self.secure.transaction.seTransactionGetEventData = function (transaction) {
    if (typeof transaction !== "number") {
        throw "Invalid transaction";
    }

    return window.webworks.execSync(_ID, "secure/transaction/seTransactionGetEventData", {
        "transaction": transaction
    });
};

// nfc_result_t
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_SUCCESS", 0x00);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_INVALID_PARAMETER", 0x01);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_FEATURE_NOT_IMPLEMENTED", 0x02);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_UNSUPPORTED_API", 0x03);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_LOCKED", 0x04);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_LIMITATION_EXCEEDED", 0x05);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_OPERATION_NOT_SUPPORTED", 0x06);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_OPERATION_REJECTED", 0x07);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_SERVICE_CONNECTION_ERROR", 0x08);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_P2P_REJECTED", 0x09);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_TIMEOUT", 0x0A);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_RESOURCE_BUSY", 0x0B);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_NOT_ENOUGH_SPACE", 0x0C);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_OUT_OF_MEMORY", 0x0D);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_FD_ACCESS_ERROR", 0x0E);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_LOCK_FAILED", 0x30);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_WRITE_FAILED", 0x31);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_READ_FAILED", 0x32);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_NOT_NFC_TAG_BUT_CAPABLE", 0x33);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_TAG_NOT_SUPPORTED", 0x34);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_BAD_NDEF_FORMAT", 0x35);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_SE_INPUT_TOO_SHORT", 0x60);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_SE_INVALID_HANDLE", 0x61);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_SE_SERVICE_NOT_READY", 0x62);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_SE_OUT_OF_LOGICAL_CHANNELS", 0x63);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_SE_AID_NOT_FOUND", 0x64);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_SE_INVALID_APDU", 0x65);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_SE_NOT_PRESENT", 0x66);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_SE_REQUEST_REJECTED", 0x67);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_SE_INVALID_SERVICE", 0x68);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_SE_SERVICES_MANAGER_NOT_INITIALIZED", 0x69);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_SE_MISSING_SERVICE_INFORMATION", 0x6A);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_UNHANDLED_ERROR", 0xFE);
window.webworks.defineReadOnlyField(_self, "NFC_RESULT_ERROR", 0xFF);

// nfc_settings_t
window.webworks.defineReadOnlyField(_self, "NFC_SETTING_ENABLED", NFC_SETTING_ENABLED);
window.webworks.defineReadOnlyField(_self, "NFC_SETTING_CE_BACKLIGHT_OFF", NFC_SETTING_CE_BACKLIGHT_OFF);
window.webworks.defineReadOnlyField(_self, "NFC_SETTING_CE_POWERED_OFF", NFC_SETTING_CE_POWERED_OFF);
window.webworks.defineReadOnlyField(_self, "NFC_SETTING_PROMPT_TO_SEND_FILES", NFC_SETTING_PROMPT_TO_SEND_FILES);

// secure_element_id_type_t
window.webworks.defineReadOnlyField(_self.secure, "SE_TYPE_SE_ID_NONE", SE_TYPE_SE_ID_NONE);
window.webworks.defineReadOnlyField(_self.secure, "SE_TYPE_UICC_SE_ID", SE_TYPE_UICC_SE_ID);
window.webworks.defineReadOnlyField(_self.secure, "SE_TYPE_EMBEDDED_SE_ID", SE_TYPE_EMBEDDED_SE_ID);

// fcp_type_t
window.webworks.defineReadOnlyField(_self.secure.access, "FCP_OPEN_NO_FCP_INFO", FCP_OPEN_NO_FCP_INFO);
window.webworks.defineReadOnlyField(_self.secure.access, "FCP_OPEN_FCP_WITH_REF_CLASS", FCP_OPEN_FCP_WITH_REF_CLASS);
window.webworks.defineReadOnlyField(_self.secure.access, "FCP_OPEN_FCP_WITH_REF_INTERFACE", FCP_OPEN_FCP_WITH_REF_INTERFACE);
window.webworks.defineReadOnlyField(_self.secure.access, "FCP_SATSA_OPEN_EMV_FCP", FCP_SATSA_OPEN_EMV_FCP);

// battery_mode_t
window.webworks.defineReadOnlyField(_self.secure.access, "BATTERY_MODE_ON", BATTERY_MODE_ON);
window.webworks.defineReadOnlyField(_self.secure.access, "BATTERY_MODE_OFF", BATTERY_MODE_OFF);

// technology_types_t
window.webworks.defineReadOnlyField(_self.secure.access, "TECHNOLOGY_TYPE_NONE", TECHNOLOGY_TYPE_NONE);
window.webworks.defineReadOnlyField(_self.secure.access, "TECHNOLOGY_TYPE_ISO14443A", TECHNOLOGY_TYPE_ISO14443A);
window.webworks.defineReadOnlyField(_self.secure.access, "TECHNOLOGY_TYPE_ISO14443B", TECHNOLOGY_TYPE_ISO14443B);
window.webworks.defineReadOnlyField(_self.secure.access, "TECHNOLOGY_TYPE_ISO14443B_PRIME", TECHNOLOGY_TYPE_ISO14443B_PRIME);
window.webworks.defineReadOnlyField(_self.secure.access, "TECHNOLOGY_TYPE_FELICA", TECHNOLOGY_TYPE_FELICA);
window.webworks.defineReadOnlyField(_self.secure.access, "TECHNOLOGY_TYPE_ISO14443A_MIFARE", TECHNOLOGY_TYPE_ISO14443A_MIFARE);
window.webworks.defineReadOnlyField(_self.secure.access, "TECHNOLOGY_TYPE_ISO15693", TECHNOLOGY_TYPE_ISO15693);


module.exports = _self;
