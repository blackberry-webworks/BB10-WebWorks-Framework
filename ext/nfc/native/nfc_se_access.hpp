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

#ifndef NFC_SE_ACCESS_WW_H_
#define NFC_SE_ACCESS_WW_H_

#include <json/value.h>
#include <pthread.h>
#include <nfc/nfc_se_access.h>
#include <webworks_utils.hpp>

#include <string>

class NfcJs;

namespace webworks {

struct NfcThreadInfo {
    NfcJs* parent;
    std::string eventId;
};

class NfcSeAccess {
public:
    explicit NfcSeAccess(NfcJs* parent = NULL);
    ~NfcSeAccess();
    static Json::Value OpenLogicalChannelDirect(const Json::Value& args);
    static Json::Value SEChannelTransmitAPDU(const Json::Value& args);
    static Json::Value SEChannelCloseChannel(const Json::Value& args);
    static Json::Value SEChannelIsClosed(const Json::Value& args);
    static Json::Value SEChannelGetSession(const Json::Value& args);
    static Json::Value SEChannelIsBasicChannel(const Json::Value& args);
    static Json::Value SEEnableSWP();
    static Json::Value SEGetActiveSEType();
    static Json::Value SEServiceGetReaders();
    static Json::Value SEReaderIsSecureElementPresent(const Json::Value& args);
    static Json::Value SEReaderOpenSession(const Json::Value& args);
    static Json::Value SEReaderCloseSessions(const Json::Value& args);
    static Json::Value SEReaderGetTechnologyTypes(const Json::Value& args);
    static Json::Value SEReaderSetTechnologyTypes(const Json::Value& args);
    static Json::Value SEReaderGetName(const Json::Value& args);
    static Json::Value SESessionOpenLogicalChannel(const Json::Value& args);
    static Json::Value SESessionOpenBasicChannel(const Json::Value& args);
    static Json::Value SESessionCloseChannels(const Json::Value& args);
    static Json::Value SESessionCloseSession(const Json::Value& args);
    static Json::Value SESessionIsSessionClosed(const Json::Value& args);
    static Json::Value SESessionGetReader(const Json::Value& args);
    static Json::Value SESessionGetATR(const Json::Value& args);
    Json::Value SESetUICCActive(const Json::Value& args);
    static void* SetUICCActiveThread(void *args);

private:
    NfcJs* m_pParent;
    static pthread_t m_thread;
};

} // namespace webworks

#endif // NFC_SE_ACCESS_WW_H_
