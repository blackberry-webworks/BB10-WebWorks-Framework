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

#ifndef PIM_MESSAGES_NDK_H_
#define PIM_MESSAGES_NDK_H_

#include <bb/pim/account/Account>
#include <bb/pim/account/AccountService>
#include <bb/pim/message/MessageService>
#include <bb/pim/message/MessageBuilder>
#include <bb/pim/message/MessageFolder>
#include <bb/pim/message/MessageContact>
#include <bb/pim/message/MessageBody>
#include <json/value.h>
#include <string>

class PimMessage;

namespace webworks {

using namespace bb::pim::account;
using namespace bb::pim::message;

struct PimMessageThreadInfo {
    PimMessage *parent;
    Json::Value *jsonObj;
    std::string eventId;
};

class PimMessageNdk/* : public QObject*/ {
   // Q_OBJECT

public:
    PimMessageNdk();
    ~PimMessageNdk();

    MessageService *messageService;
    AccountService *accountService;

    Json::Value getAccounts();
    Json::Value getDefaultAccount();
    Json::Value getMessage(const Json::Value &argsObj);
    Json::Value send(const Json::Value &argsObj);
    Json::Value save(const Json::Value &argsObj);
    Json::Value saveAttachment(const Json::Value &argsObj);

private Q_SLOTS:
    void attachmentDownloaded();

private:
    //Serialize PIM classes
    Json::Value accountToJson(Account account);
    Json::Value folderToJson(MessageFolder folder);
    Json::Value attachmentsToJson(QList<Attachment> attachments);
    Json::Value recipientsToJson(QList<MessageContact> recipients);
    Json::Value messageToJson(Message message);
    std::string keyToString(qint64 key);

    //Extract basic types from JSON
    qint64 jsonToKey(const Json::Value &value);
    QString jsonToQString(const Json::Value &value);
    QUrl jsonToQUrl(const Json::Value &value);
    qint64 getFolderIdByName(AccountKey id, QString folderName);

    //Constuct PIM classes from JSON
    void constructMessage(const Json::Value &value, MessageBuilder *builder);
    void constructSubject(const Json::Value &value, MessageBuilder *builder);
    void constructBody(const Json::Value &value, MessageBuilder *builder);
    void constructRecipients(const Json::Value &value, MessageBuilder *builder);
    void constructAttachments(const Json::Value &value, MessageBuilder *builder);
    void addMessageProperties(const Json::Value &value, MessageBuilder *builder);
    MessageContact jsonToRecipient(const Json::Value &value);
    Attachment jsonToAttachment(const Json::Value &value);
};

} // namespace webworks

#endif // PIM_MESSAGES_NDK_H_
