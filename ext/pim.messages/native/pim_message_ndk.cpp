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

#include <json/value.h>
#include <json/writer.h>
#include <stdio.h>
#include <string>
#include <sstream>
#include <QList>
#include "pim_message_ndk.hpp"

namespace webworks {

    PimMessageNdk::PimMessageNdk()
    {
        messageService = new MessageService();
        accountService = new AccountService();

        //connect(messageService, SIGNAL(attachmentDownloaded(bb::pim::account::AccountKey accountId, bb::pim::message::MessageKey messageId, bb::pim::message::AttachmentKey attachmentId)), SLOT(attachmentDownloaded()));
    }

    PimMessageNdk::~PimMessageNdk()
    {
        messageService->~MessageService();
        accountService->~AccountService();
    }

    /*
    ----Public Functions
    */

    Json::Value PimMessageNdk::getAccounts()
    {
        Json::Value accountArray;

        const QList<Account>accountList = accountService->accounts(Service::Messages);
        for (int i = 0; i < accountList.size(); i++)
        {
            Account account = accountList[i];
            accountArray.append(accountToJson(account));
        }

        return accountArray;
    }

    Json::Value PimMessageNdk::getDefaultAccount()
    {
        Json::Value defaultAccountJson;

        const QMap<Service::Type, Account> defaultAccounts = accountService->defaultAccounts();
        Account defaultAccount = defaultAccounts[Service::Messages];
        defaultAccountJson = accountToJson(defaultAccount);

        return defaultAccountJson;
    }

    Json::Value PimMessageNdk::getMessage(const Json::Value &argsObj)
    {
        fprintf(stderr, "ndk getMessage: %s\n", argsObj.toStyledString().c_str());
        AccountKey accountId = jsonToKey(argsObj["accountId"]);
        fprintf(stderr, "accountId: %d\n", static_cast<int>(accountId));
        MessageKey messageId = jsonToKey(argsObj["messageId"]);
        fprintf(stderr, "messageId: %d\n", static_cast<int>(messageId));
        //verify ids

        Message message =  messageService->message(accountId, messageId);
        fprintf(stderr, "after recovering message\n");
        Json::Value messageJson = messageToJson(message);
        messageJson["folder"] = Json::Value(messageService->folder(accountId, message.folderId()).name().toStdString());
        messageJson["account"] = accountToJson(accountService->account(accountId));
        fprintf(stderr, "after writing folder property\n");
        return messageJson;
    }

    Json::Value PimMessageNdk::send(const Json::Value &argsObj)
    {
        Json::Value returnObj;
        fprintf(stderr, "in send function: %s\n", argsObj.toStyledString().c_str());

        AccountKey accId = jsonToKey(argsObj["account"]["id"]);
        if (argsObj["status"].asString() == "new")
        {
            MessageBuilder *builder =  MessageBuilder::create(accId);
            constructMessage(argsObj, builder);
            Message message = *builder;
            MessageKey messageId = messageService->send(accId, message);
            MessageFolderKey folderId = messageService->message(accId, messageId).folderId();

            returnObj["_success"] = (messageId > 0) ? true : false;
            returnObj["msgKey"] = Json::Value(messageId);
            returnObj["folder"] = Json::Value(messageService->folder(accId, folderId).name().toStdString());
        }
        else
        {
            fprintf(stderr, "tried to send a non-new message\n");
            returnObj["_success"] = false;
        }

        fprintf(stderr, "send returnObj: %s\n", returnObj.toStyledString().c_str());
        return returnObj;
    }

    Json::Value PimMessageNdk::save(const Json::Value &argsObj)
    {
        Json::Value returnObj;

        AccountKey accId = jsonToKey(argsObj["account"]["id"]);
        MessageKey msgKey;
        Message message;
        MessageBuilder *builder;
        std::string state = argsObj["status"].asString();

        if (state == "new" || state == "draft") //saving a new message
        {
            builder = MessageBuilder::create(accId);
            constructMessage(argsObj, builder);
            message = *builder;
            msgKey = messageService->save(accId, message);
            Message s_message = messageService->message(accId, msgKey);

            returnObj["msgKey"] = Json::Value(msgKey);
            returnObj["folder"] = Json::Value(s_message.folderId());
        }
        else //saving an existing message
        {
            message = messageService->message(accId, jsonToKey(argsObj["id"]));
            builder = MessageBuilder::create(accId, message);
            builder->removeAllRecipients();
            builder->removeAllAttachments();
            constructMessage(argsObj, builder);
            MessageFolderKey folderId = getFolderIdByName(accId, jsonToQString(argsObj["folder"]));
            message = *builder;
            messageService->file(accId, message.id(), folderId);

            returnObj["folder"] = Json::Value(folderId);
        }

        returnObj["_success"] = true;

        return returnObj;
    }

    Json::Value PimMessageNdk::saveAttachment(const Json::Value &argsObj)
    {
        Json::Value returnObj;
        AttachmentKey attId = jsonToKey(argsObj["id"]);
        MessageKey msgId = jsonToKey(argsObj["mid"]);
        AccountKey accId = jsonToKey(argsObj["aid"]);

        if (attId && msgId && accId)
        {
            messageService->downloadAttachment(accId, msgId, attId);
            //currently not checking that download was successful
            returnObj["_success"] = true;
        }
        else
        {
            returnObj["_success"] = false;
        }

        return returnObj;
    }

    /*
    ----Private Functions
    */

    Json::Value PimMessageNdk::accountToJson(Account account)
    {
        Json::Value accountJson;

        accountJson["id"] = Json::Value(keyToString(account.id()));
        accountJson["name"] = Json::Value(account.displayName().toStdString());
        accountJson["social"] = Json::Value(account.isSocial());
        accountJson["enterpriseType"] = Json::Value(account.isEnterprise());

        Json::Value accountFoldersArray;
        const QList<MessageFolder> accountFolders = messageService->folders(account.id());
        for (int i = 0; i < accountFolders.size(); i++)
        {
            MessageFolder messageFolder = accountFolders[i];
            accountFoldersArray.append(folderToJson(messageFolder));
        }
        accountJson["folders"] = accountFoldersArray;

        return accountJson;
    }

    Json::Value PimMessageNdk::folderToJson(MessageFolder folder)
    {
        Json::Value folderJson;

        folderJson["type"] = Json::Value(folder.type());
        folderJson["name"] = Json::Value(folder.name().toStdString());
        folderJson["id"] = Json::Value(folder.id());

        return folderJson;
    }

    Json::Value PimMessageNdk::attachmentsToJson(QList<Attachment> attachments)
    {
        Json::Value attachmentsArray;
        for (int i = 0; i < attachments.size(); i++)
        {
            Attachment attachment = attachments[i];
            Json::Value attachmentJson;
            attachmentJson["name"] = Json::Value(attachment.name().toStdString());
            attachmentJson["mimeType"] = Json::Value(attachment.mimeType().toStdString());
            attachmentJson["id"] = Json::Value(attachment.id());
            attachmentsArray.append(attachmentJson);
        }
        return attachmentsArray;
    }

    Json::Value PimMessageNdk::recipientsToJson(QList<MessageContact> recipients)
    {
        Json::Value recipientsArray;
        for (int i = 0; i < recipients.size(); i++)
        {
            MessageContact recipient = recipients[i];
            Json::Value recipientJson;
            recipientJson["displayName"] = Json::Value(recipient.displayableName().toStdString());
            recipientJson["email"] = Json::Value(recipient.address().toStdString());
            recipientJson["type"] = Json::Value(recipient.type());
            recipientsArray.append(recipientJson);
        }
        return recipientsArray;
    }

    Json::Value PimMessageNdk::messageToJson(Message message)
    {
        Json::Value messageJson;

        MessageBody mBody = message.body(MessageBody::PlainText);
        MessageStatus::Types mStatus = message.status();
        Json::Value jsonMsgStatus;

        switch (mStatus) {
            case (MessageStatus::Sent):
                jsonMsgStatus = Json::Value("sent");
                break;
            case (MessageStatus::Draft):
                jsonMsgStatus = Json::Value("draft");
                break;
            default:
                jsonMsgStatus = Json::Value("recieved");
        }

        messageJson["id"] = Json::Value(message.id());
        messageJson["addresses"] = recipientsToJson(message.recipients());
        messageJson["attachments"] = attachmentsToJson(message.attachments());
        messageJson["subject"] = Json::Value(message.subject().toStdString());
        messageJson["bodyType"] = Json::Value(mBody.type());
        messageJson["body"] = Json::Value(mBody.plainText().toStdString());
        messageJson["priority"] = Json::Value(message.priority());
        messageJson["flagged"] = Json::Value(message.followupFlag().isSet());
        messageJson["read"] = Json::Value((message.status() == MessageStatus::Read) ? true : false);
        messageJson["status"] = jsonMsgStatus;

        return messageJson;
    }


    std::string PimMessageNdk::keyToString(qint64 key)
    {
        std::stringstream ss;
        ss << key;
        return ss.str();
    }

    qint64 PimMessageNdk::jsonToKey(const Json::Value &value)
    {
        qint64 key;
        std::stringstream sstream(value.asString());
        sstream >> key;
        return key;
    }

    QString PimMessageNdk::jsonToQString(const Json::Value &value)
    {
        return QString(value.asCString());
    }

    QUrl PimMessageNdk::jsonToQUrl(const Json::Value &value)
    {
        return QUrl(jsonToQString(value));
    }

    MessageContact PimMessageNdk::jsonToRecipient(const Json::Value &value)
    {
        return MessageContact(-1, MessageContact::To, QString(), jsonToQString(value["email"]));
    }

    Attachment PimMessageNdk::jsonToAttachment(const Json::Value &value)
    {
        return Attachment(jsonToQString(value["mimeType"]), jsonToQString(value["name"]), jsonToQUrl(value["filePath"]));
    }

    qint64 PimMessageNdk::getFolderIdByName(AccountKey id, QString name)
    {
        qint64 folderId = 0;
        QList<MessageFolder> folders = messageService->folders(id);
        for (int i = 0; i < folders.size(); i++)
        {
            if (folders[i].name() == name)
            {
                folderId = folders[i].id();
                break;
            }
        }
        return folderId;
    }

    void PimMessageNdk::constructSubject(const Json::Value &value, MessageBuilder *builder)
    {
        fprintf(stderr, "constructSubject\n");
        builder->subject(jsonToQString(value["subject"]));
        return;
    }

    void PimMessageNdk::constructBody(const Json::Value &value, MessageBuilder *builder)
    {
        fprintf(stderr, "constructBody\n");
        MessageBody::Type bodyType = (value["bodyType"].asString() == "Html") ? MessageBody::Html : MessageBody::PlainText;
        const QByteArray bodyData = jsonToQString(value["body"]).toUtf8();
        builder->body(bodyType, bodyData);
        return;
    }

    void PimMessageNdk::constructRecipients(const Json::Value &value, MessageBuilder *builder)
    {
        fprintf(stderr, "constructRecipients\n");
        for (unsigned int i = 0; i < value["addresses"].size(); i++)
        {
            MessageContact recipient = jsonToRecipient(value["addresses"][i]);
            builder->addRecipient(recipient);
        }
        return;
    }

    void PimMessageNdk::constructAttachments(const Json::Value &value, MessageBuilder *builder)
    {
        fprintf(stderr, "constructAttachments\n");
        for (unsigned int i = 0; i < value["attachments"].size(); i++)
        {
            Attachment attachment = jsonToAttachment(value["attachments"][i]);
            builder->addAttachment(attachment);
        }
        return;
    }

    void PimMessageNdk::addMessageProperties(const Json::Value &value, MessageBuilder *builder)
    {
        fprintf(stderr, "addMessageProperties\n");
        if (value.isMember("priority"))
        {
            switch (value["priority"].asInt())
            {
                case 0:
                    builder->priority(MessagePriority::Low);
                    break;
                case 2:
                    builder->priority(MessagePriority::High);
                    break;
                default:
                    builder->priority(MessagePriority::Normal);
            }
        }
        if (value.isMember("flagged")) builder->followupFlag(MessageFlag(value["flagged"].asBool()));
    }

    void PimMessageNdk::constructMessage(const Json::Value &value, MessageBuilder *builder)
    {
        fprintf(stderr, "constructMessage\n");
        constructSubject(value, builder);
        constructBody(value, builder);
        constructRecipients(value, builder);
        constructAttachments(value, builder);
        addMessageProperties(value, builder);
        return;
    }

} //namespace webworks
