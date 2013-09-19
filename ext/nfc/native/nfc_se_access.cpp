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

#include <json/value.h>
#include <json/writer.h>
#include <stdio.h>
#include <resolv.h>
#include <webworks_utils.hpp>
#include <bps/bps.h>
#include <bps/event.h>
#include <nfc/nfc_bps.h>

#include <string>

#include "nfc_se_access.hpp"
#include "nfc_js.hpp"

namespace webworks {

pthread_t NfcSeAccess:: m_thread = 0;

NfcSeAccess::NfcSeAccess(NfcJs* parent) : m_pParent(parent)
{
}

NfcSeAccess::~NfcSeAccess()
{
}

/****************************************************************
 * Public Functions
 ****************************************************************/

Json::Value NfcSeAccess::OpenLogicalChannelDirect(const Json::Value& args)
{
    Json::Value returnObj;

    secure_element_id_type_t seType;

    if (!args.isMember("seType") || !args["seType"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    } else {
        seType = static_cast<secure_element_id_type_t>(args["seType"].asInt());

        if (seType != UICC_SE_ID && seType != EMBEDDED_SE_ID) {
            returnObj["_success"] = false;
            return returnObj;
        }
    }

    if (!args.isMember("aidStr") || !args["aidStr"].isString() || !args.isMember("aidLen") || !args["aidLen"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    if (!args.isMember("fcpType") || !args["fcpType"].isString()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    fcp_type_t fcpType = static_cast<fcp_type_t>(args["fcpType"].asInt());

    uint8_t* aid = new uint8_t[args["aidLen"].asInt()];
    // convert base64 string to aid uint8 array
    b64_pton(args["aidStr"].asCString(), aid, sizeof(aid));

    uint32_t seSession;
    uint32_t seChannel;
    int32_t responseLen;

    nfc_result_t result = nfc_se_open_logical_channel_direct(seType, aid, sizeof(aid), fcpType, &seSession, &seChannel, &responseLen);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["session"] = seSession;
        returnObj["channel"] = seChannel;
        returnObj["responseLen"] = responseLen;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    delete aid;

    return returnObj;
}

Json::Value NfcSeAccess::SEChannelTransmitAPDU(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("channel") || !args["channel"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    if (!args.isMember("apduStr") || !args["apduStr"].isString() || !args.isMember("apduLen") || !args["apduLen"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t channel = args["channel"].asInt();

    uint8_t* apdu = new uint8_t[args["apduLen"].asInt()];
    // convert base64 string to aid uint8 array
    b64_pton(args["apduStr"].asCString(), apdu, sizeof(apdu));

    size_t responseLen;

    nfc_result_t result = nfc_se_channel_transmit_apdu(channel, apdu, sizeof(apdu), &responseLen);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["responseLen"] = responseLen;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    delete apdu;

    return returnObj;
}

Json::Value NfcSeAccess::SEChannelGetTransmitData(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("channel") || !args["channel"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    if (!args.isMember("responseLen") || !args["responseLen"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t channel = args["channel"].asInt();

    uint8_t* response = new uint8_t[args["responseLen"].asInt()];

    size_t responseLen;

    nfc_result_t result = nfc_se_channel_get_transmit_data(channel, response, &responseLen);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        // convert response to send as a base64 string
        returnObj["response"] = webworks::Utils::toBase64(response, responseLen);
        returnObj["responseLen"] = responseLen;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    delete response;

    return returnObj;
}

Json::Value NfcSeAccess::SEChannelCloseChannel(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("channel") || !args["channel"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t channel = args["channel"].asInt();

    nfc_result_t result = nfc_se_channel_close_channel(channel);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SESessionCloseSession(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("session") || !args["session"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t session = args["session"].asInt();

    nfc_result_t result = nfc_se_session_close_session(session);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SEChannelIsClosed(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("channel") || !args["channel"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t channel = args["channel"].asInt();
    bool isClosed;

    nfc_result_t result = nfc_se_channel_is_closed(channel, &isClosed);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["isClosed"] = isClosed;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SEChannelGetSession(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("channel") || !args["channel"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t channel = args["channel"].asInt();
    uint32_t session;

    nfc_result_t result = nfc_se_channel_get_session(channel, &session);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["session"] = session;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SEChannelIsBasicChannel(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("channel") || !args["channel"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t channel = args["channel"].asInt();
    bool isBasicChannel;

    nfc_result_t result = nfc_se_channel_is_basic_channel(channel, &isBasicChannel);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["isBasicChannel"] = isBasicChannel;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SEEnableSWP()
{
    Json::Value returnObj;

    nfc_result_t result = nfc_se_enable_swp();

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SEGetActiveSEType()
{
    Json::Value returnObj;
    secure_element_id_type_t seType;

    nfc_result_t result = nfc_se_get_active_se_type(&seType);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["seType"] = seType;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SEServiceGetNumReaders()
{
    Json::Value returnObj;
    uint32_t numReaders;

    nfc_result_t result = nfc_se_service_get_num_readers(&numReaders);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["numReaders"] = numReaders;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SEServiceGetReaders(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("numReaders") || !args["numReaders"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t numReaders = args["numReaders"].asInt();
    uint32_t* readers = new uint32_t[numReaders];

    nfc_result_t result = nfc_se_service_get_readers(readers, &numReaders);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["readers"] = Json::Value();

        for (uint32_t i = 0; i < numReaders; i++) {
            returnObj["readers"].append(Json::Value(readers[i]));
        }
        returnObj["numReaders"] = numReaders;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    delete readers;

    return returnObj;
}

Json::Value NfcSeAccess::SEReaderOpenSession(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("reader") || !args["reader"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t session;
    uint32_t reader = args["reader"].asInt();

    nfc_result_t result = nfc_se_reader_open_session(reader, &session);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["session"] = session;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SEReaderGetName(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("reader") || !args["reader"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    // sample code uses 10 for the number of characters for reader name
    static int DEF_LEN = 10;
    uint32_t len = DEF_LEN;
    uint32_t reader = args["reader"].asInt();
    char readerName[DEF_LEN];

    nfc_result_t result = nfc_se_reader_get_name(reader, readerName, &len);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["readerName"] = readerName;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SESessionOpenLogicalChannel(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("session") || !args["session"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    if (!args.isMember("aidStr") || !args["aidStr"].isString() || !args.isMember("aidLen") || !args["aidLen"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    if (!args.isMember("fcpType") || !args["fcpType"].isString()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    fcp_type_t fcpType = static_cast<fcp_type_t>(args["fcpType"].asInt());

    uint8_t* aid = new uint8_t[args["aidLen"].asInt()];
    // convert base64 string to aid uint8 array
    b64_pton(args["aidStr"].asCString(), aid, sizeof(aid));

    uint32_t session = args["session"].asInt();

    uint32_t channel;
    int32_t responseLen;

    nfc_result_t result = nfc_se_session_open_logical_channel(session, aid, sizeof(aid), fcpType, &channel, &responseLen);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["channel"] = channel;
        returnObj["responseLen"] = responseLen;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    delete aid;

    return returnObj;
}

Json::Value NfcSeAccess::SESessionCloseChannels(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("session") || !args["session"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    nfc_result_t result = nfc_se_session_close_channels(args["session"].asInt());

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SESessionGetReader(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("session") || !args["session"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t reader;

    nfc_result_t result = nfc_se_session_get_reader(args["session"].asInt(), &reader);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["reader"] = reader;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SESessionOpenBasicChannel(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("session") || !args["session"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    if (!args.isMember("fcpType") || !args["fcpType"].isString()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    fcp_type_t fcpType = static_cast<fcp_type_t>(args["fcpType"].asInt());
    uint32_t session = args["session"].asInt();

    uint32_t channel;
    int32_t responseLen;

    nfc_result_t result = nfc_se_session_open_basic_channel(session, fcpType, &channel, &responseLen);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["channel"] = channel;
        returnObj["responseLen"] = responseLen;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SESessionIsSessionClosed(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("session") || !args["session"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t session = args["session"].asInt();
    bool isClosed;

    nfc_result_t result = nfc_se_session_is_session_closed(session, &isClosed);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["isClosed"] = isClosed;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SESessionGetATR(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("session") || !args["session"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t session = args["session"].asInt();
    // According to this link, there are a total of 2 to 33 characters in the ATR
    // http://en.wikipedia.org/wiki/Answer_to_reset
    uint8_t* atr = new uint8_t[40];
    size_t atrLenInBytes = sizeof(atr);
    size_t returnedATRLenInBytes;

    // convert atr to send as a base64 string
    nfc_result_t result = nfc_se_session_get_atr(session, atr, atrLenInBytes, &returnedATRLenInBytes);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["atr"] = webworks::Utils::toBase64(atr, returnedATRLenInBytes);
        returnObj["returnedATRInBytesLen"] = returnedATRLenInBytes;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    delete atr;

    return returnObj;
}

Json::Value NfcSeAccess::SEReaderGetTechnologyTypes(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("session") || !args["session"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    if (!args.isMember("batteryMode") || !args["batteryMode"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t session = args["session"].asInt();
    uint32_t batteryMode = args["batteryMode"].asInt();
    uint32_t technologyTypes;

    nfc_result_t result = nfc_se_reader_get_technology_types(session, batteryMode, &technologyTypes);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["technologyTypes"] = technologyTypes;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SEReaderSetTechnologyTypes(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("session") || !args["session"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    if (!args.isMember("technologyTypes") || !args["technologyTypes"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    uint32_t session = args["session"].asInt();
    uint32_t technologyTypes = args["technologyTypes"].asInt();

    nfc_result_t result = nfc_se_reader_set_technology_types(session, technologyTypes);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeAccess::SESetUICCActive(const Json::Value& args)
{
    Json::Value returnObj;

    if (!m_thread) {
        if (!args.isMember("_eventId") || !args["_eventId"].isString()) {
            returnObj["_success"] = false;
            return returnObj;
        }

        std::string eventId = args["_eventId"].asString();
        nfc_result_t result = nfc_se_set_uicc_active();

        webworks::NfcThreadInfo* threadInfo = new webworks::NfcThreadInfo;
        threadInfo->parent = m_pParent;
        threadInfo->eventId = eventId;

        int error = pthread_create(&m_thread, NULL, SetUICCActiveThread, static_cast<void *>(threadInfo));

        if (error) {
            m_thread = 0;
        }

        if (result == NFC_RESULT_SUCCESS) {
            returnObj["_success"] = true;

        } else {
            returnObj["_success"] = false;
            returnObj["code"] = result;
        }
    } else {
        returnObj["_success"] = false;
    }

    return returnObj;
}

// This method is done by pure guess
// NFC API docs don't really give examples
// This is hacked together based on:
// http://developer.blackberry.com/native/reference/bb10/nfc_libref/topic/nfc_se_set_uicc_active.html
// http://developer.blackberry.com/native/reference/bb10/nfc_libref/topic/nfc_event_type_t.html
// http://blackberry.github.io/Cascades-Samples/nfcdemo.html
void* NfcSeAccess::SetUICCActiveThread(void *args)
{
    webworks::NfcThreadInfo* threadInfo = static_cast<webworks::NfcThreadInfo*>(args);
    NfcJs* parent = threadInfo->parent;
    std::string eventId = threadInfo->eventId;

    int status = bps_initialize();
    status = nfc_request_events();

    if (status == NFC_RESULT_SUCCESS) {
        bps_event_t* event;
        nfc_event_t* nfcEvent = NULL;
        unsigned int code;

        for (;;) {
            status = bps_get_event(&event, -1);
            code = bps_event_get_code(event);
            status = nfc_get_nfc_event(event, &nfcEvent);

            if (status == NFC_RESULT_SUCCESS) {
                if (code == NFC_CE_SET_UICC_ACTIVE_SE_TYPE_EVENT) {
                    unsigned int eventVal;
                    nfc_result_t result = nfc_get_notification_value(nfcEvent, &eventVal);
                    parent->NotifyEvent(eventId, webworks::Utils::intToStr(result));
                    break;
                }
            }
        }
    }

    nfc_stop_events();
    bps_shutdown();
    delete threadInfo;
    m_thread = 0;

    return NULL;
}

} // namespace webworks

