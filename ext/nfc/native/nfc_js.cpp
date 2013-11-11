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

#include <json/reader.h>
#include <json/writer.h>
#include <string>
#include "nfc_js.hpp"
#include "nfc.hpp"
#include "nfc_se_access.hpp"
#include "nfc_se_transaction.hpp"

NfcJs::NfcJs(const std::string& id) : m_id(id)
{
}

char* onGetObjList()
{
    // Return list of classes in the object
    static char name[] = "Nfc";
    return name;
}

JSExt* onCreateObject(const std::string& className, const std::string& id)
{
    // Make sure we are creating the right class
    if (className != "Nfc") {
        return 0;
    }

    return new NfcJs(id);
}

std::string NfcJs::InvokeMethod(const std::string& command)
{
    unsigned int index = command.find_first_of(" ");

    string strCommand;
    string jsonObject;
    Json::Value obj;

    if (index != std::string::npos) {
        strCommand = command.substr(0, index);
        jsonObject = command.substr(index + 1, command.length());

        // Parse the JSON
        obj = new Json::Value;
        bool parse = Json::Reader().parse(jsonObject, obj);

        if (!parse) {
            return "Cannot parse JSON object";
        }
    } else {
        strCommand = command;
    }

    if (strCommand == "getSetting") {
        std::string result = Json::FastWriter().write(webworks::Nfc::GetSetting(obj));
        return result;
    } else if (strCommand == "setSetting") {
        std::string result = Json::FastWriter().write(webworks::Nfc::SetSetting(obj));
        return result;
    } else if (strCommand == "openLogicalChannelDirect") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::OpenLogicalChannelDirect(obj));
        return result;
    } else if (strCommand == "seChannelTransmitAPDU") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEChannelTransmitAPDU(obj));
        return result;
    } else if (strCommand == "seChannelGetTransmitData") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEChannelGetTransmitData(obj));
        return result;
    } else if (strCommand == "seChannelCloseChannel") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEChannelCloseChannel(obj));
        return result;
    } else if (strCommand == "seSessionCloseSession") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SESessionCloseSession(obj));
        return result;
    } else if (strCommand == "seChannelIsClosed") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEChannelIsClosed(obj));
        return result;
    } else if (strCommand == "seChannelGetSession") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEChannelGetSession(obj));
        return result;
    } else if (strCommand == "seChannelIsBasicChannel") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEChannelIsBasicChannel(obj));
        return result;
    } else if (strCommand == "seSetUICCActive") {
        webworks::NfcSeAccess nfcAccess(this);
        std::string result = Json::FastWriter().write(nfcAccess.SESetUICCActive(obj));
        return result;
    } else if (strCommand == "seEnableSWP") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEEnableSWP());
        return result;
    } else if (strCommand == "seGetActiveSEType") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEGetActiveSEType());
        return result;
    } else if (strCommand == "seServiceGetNumReaders") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEServiceGetNumReaders());
        return result;
    } else if (strCommand == "seServiceGetReaders") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEServiceGetReaders(obj));
        return result;
    } else if (strCommand == "seReaderIsSecureElementPresent") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEReaderIsSecureElementPresent(obj));
        return result;
    } else if (strCommand == "seReaderOpenSession") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEReaderOpenSession(obj));
        return result;
    } else if (strCommand == "seReaderGetName") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEReaderGetName(obj));
        return result;
    } else if (strCommand == "seReaderGetTechnologyTypes") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEReaderGetTechnologyTypes(obj));
        return result;
    } else if (strCommand == "seReaderSetTechnologyTypes") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SEReaderSetTechnologyTypes(obj));
        return result;
    } else if (strCommand == "seSessionOpenLogicalChannel") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SESessionOpenLogicalChannel(obj));
        return result;
    } else if (strCommand == "seSessionOpenBasicChannel") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SESessionOpenBasicChannel(obj));
        return result;
    } else if (strCommand == "seSessionCloseChannels") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SESessionCloseChannels(obj));
        return result;
    } else if (strCommand == "seSessionIsSessionClosed") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SESessionIsSessionClosed(obj));
        return result;
    } else if (strCommand == "seSessionGetATR") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SESessionGetATR(obj));
        return result;
    } else if (strCommand == "seSessionGetReader") {
        std::string result = Json::FastWriter().write(webworks::NfcSeAccess::SESessionGetReader(obj));
        return result;
    } else if (strCommand == "seParseTransaction") {
        std::string result = Json::FastWriter().write(webworks::NfcSeTransaction::SEParseTransaction(obj));
        return result;
    } else if (strCommand == "seTransactionGetSEType") {
        std::string result = Json::FastWriter().write(webworks::NfcSeTransaction::SETransactionGetSEType(obj));
        return result;
    } else if (strCommand == "seTransactionGetProtocol") {
        std::string result = Json::FastWriter().write(webworks::NfcSeTransaction::SETransactionGetProtocol(obj));
        return result;
    } else if (strCommand == "seFreeTransaction") {
        std::string result = Json::FastWriter().write(webworks::NfcSeTransaction::SEFreeTransaction(obj));
        return result;
    } else if (strCommand == "seTransactionForegroundApplication") {
        std::string result = Json::FastWriter().write(webworks::NfcSeTransaction::SETransactionForegroundApplication());
        return result;
    } else if (strCommand == "SETransactionGetNumberOfAIDs") {
        std::string result = Json::FastWriter().write(webworks::NfcSeTransaction::SETransactionGetNumberOfAIDs(obj));
        return result;
    } else if (strCommand == "SETransactionGetAID") {
        std::string result = Json::FastWriter().write(webworks::NfcSeTransaction::SETransactionGetAID(obj));
        return result;
    } else if (strCommand == "SETransactionGetEventDataLength") {
        std::string result = Json::FastWriter().write(webworks::NfcSeTransaction::SETransactionGetEventDataLength(obj));
        return result;
    } else if (strCommand == "SETransactionGetEventData") {
        std::string result = Json::FastWriter().write(webworks::NfcSeTransaction::SETransactionGetEventData(obj));
        return result;
    }

    return "";
}

bool NfcJs::CanDelete()
{
    return true;
}

// Notifies JavaScript of an event
void NfcJs::NotifyEvent(const std::string& eventId, const std::string& event)
{
    std::string eventString = m_id + "  result ";
    eventString.append(eventId);
    eventString.append(" ");
    eventString.append(event);
    SendPluginEvent(eventString.c_str(), m_pContext);
}
