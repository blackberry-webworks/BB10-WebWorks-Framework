ifndef QCONFIG
QCONFIG=qconfig.mk
endif
include $(QCONFIG)

NAME=pm
PLUGIN=yes
UTILS=yes

include ../../../../meta.mk

#QTPLUGIN=yes
#WEBWORKS_DIR=$(PROJECT_ROOT)/../../..

SRCS+=pim_message_js.cpp \
      pim_message_ndk.cpp

ifeq ($(UNITTEST),yes)
#NAME=test
#SRCS+=test_main.cpp
#LIBS+=img
USEFILE=
endif

include $(MKFILES_ROOT)/qtargets.mk

LIBS+=bbpim QtCore
