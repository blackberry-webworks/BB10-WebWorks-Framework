ifndef QCONFIG
QCONFIG=qconfig.mk
endif
include $(QCONFIG)

NAME=nfcww
PLUGIN=yes
UTILS=yes

include ../../../../meta.mk

SRCS+=nfc.cpp \
      nfc_js.cpp \
      nfc_se_access.cpp \
      nfc_se_transaction.cpp

include $(MKFILES_ROOT)/qtargets.mk

LIBS+=nfc socket
