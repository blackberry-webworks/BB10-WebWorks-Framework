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

#ifndef PUSH_JS_H_
#define PUSH_JS_H_

#include <bb/communications/push/PushErrno.hpp>
#include <bb/communications/push/PushService.hpp>

#include <unistd.h>
#include <pthread.h>
#include <sys/select.h>
#include <stdio.h>
#include <stdlib.h>
#include <iostream.h>
#include <fstream.h>

#include <sstream>
#include <string>
#include <algorithm>

#include "../common/plugin.h"

using namespace bb::communications::push;

// groups
#define PNS_ENTERPRISE_GROUP    1200        // enterprise
#define PNS_PERSONAL_GROUP      1000        // personal

#define INVALID_PPS_FILE_DESCRIPTOR     -1

enum PipeFileDescriptor {
       PIPE_READ_FD = 0,
       PIPE_WRITE_FD,
       PIPE_FD_SIZE
};

class Push: public JSExt, public PushListener {
public:
    explicit Push(const std::string& id);
    virtual ~Push();

// Interfaces defined in JSExt
    virtual std::string InvokeMethod(const std::string& command);
    virtual bool CanDelete();

// Interfaces defined in PushListener
    /** Call back in response to createSession call
     *
     *  @param status   PushStatus response for the createSession request call
     *
     */
    virtual void onCreateSessionComplete(const PushStatus& status);

    /** Call back in response to createChannel call
     *
     *  @param status   PushStatus response for the createChannel request call
     *  @param token    The token received from the Push Notification
     *                  Service after successfully creating the push channel
     *                  This token should be communicated to the Push Initiator.
     */
    virtual void onCreateChannelComplete(const PushStatus& status, const std::string& token);

    /** Call back in response to destroyChannel call
     *
     *  @param status   PushStatus response for the destroyChannel request call
     *
     */
    virtual void onDestroyChannelComplete(const PushStatus& status);

    /** Call back in response to registerToLaunch call
     *
     *  @param status   PushStatus response for the registerToLaunch call
     *
     */
    virtual void onRegisterToLaunchComplete(const PushStatus& status);

    /** Call back in response to unregisterFromLaunch call
     *
     *  @param status   PushStatus response for the unregisterFromLaunch call
     *
     */
    virtual void onUnregisterFromLaunchComplete(const PushStatus& status);

    /** The call back that is invoked when SIM card is changed.
     *  When this happens, the push is stopped, and it is recommended
     *  to close the push listener, and call create channel
     *
     */
    virtual void onSimChange();

// My members
    void notifyEvent(const std::string& eventId, const std::string& eventArgs);
    void monitorMessages();

private:
    std::string startService();
    std::string createChannel();
    std::string destroyChannel();
    std::string extractPushPayload();
    std::string launchApplicationOnPush();
    std::string acknowledge();

    int startMonitorThread();

private:
    std::string m_id; // JNext id

    std::string m_invokeTargetId;
    std::string m_appId;
    std::string m_ppgUrl;
    PushService* m_pPushService;
    int m_fileDescriptor; // Push service file descriptor
    pthread_t m_monitorThread;
    int m_pipeFileDescriptors[PIPE_FD_SIZE];      // pipe to write dummy data to wake up select
    bool m_shutdownThread;
};

#endif /* PUSH_JS_H_ */
