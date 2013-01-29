TEMPLATE = lib
TARGET = pm

CONFIG += qt

SOURCES += *.cpp \
           ../../../dependencies/jnext_1_0_8_3/jncore/jnext-extensions/common/plugin.cpp
HEADERS += *.hpp
LIBS += -lbbpim -L ../../json/native/arm/so.le-v7/ -ljson


device {
    DESTDIR = arm/so.le-v7
}

OBJECTS_DIR = $${DESTDIR}/.obj
MOC_DIR = $${DESTDIR}/.moc

QMAKE_LFLAGS += -Wl,-rpath,./app/native/plugins/jnext
