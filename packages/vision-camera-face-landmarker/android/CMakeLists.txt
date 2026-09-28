project(FaceLandmarker)
cmake_minimum_required(VERSION 3.9.0)

set(PACKAGE_NAME FaceLandmarker)
set(CMAKE_CXX_STANDARD 20)

add_library(${PACKAGE_NAME} SHARED
        src/main/cpp/cpp-adapter.cpp
)

# Nitrogen-generated specs
include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/FaceLandmarker+autolinking.cmake)

include_directories(
        "src/main/cpp"
)

find_library(LOG_LIB log)

# Our .nitro.ts spec imports VisionCamera's `Frame` type, so nitrogen's
# generated C++ expects `<VisionCamera/HybridFrameSpec.hpp>` -- exposed by
# react-native-vision-camera's own prefab module (confirmed on-device:
# "file not found" without this).
find_package(react-native-vision-camera REQUIRED)

target_link_libraries(
        ${PACKAGE_NAME}
        ${LOG_LIB}
        android
        react-native-vision-camera::VisionCamera
)
