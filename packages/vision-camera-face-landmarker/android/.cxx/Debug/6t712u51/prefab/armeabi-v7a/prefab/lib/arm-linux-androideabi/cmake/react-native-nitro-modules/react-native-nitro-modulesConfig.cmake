if(NOT TARGET react-native-nitro-modules::NitroModules)
add_library(react-native-nitro-modules::NitroModules SHARED IMPORTED)
set_target_properties(react-native-nitro-modules::NitroModules PROPERTIES
    IMPORTED_LOCATION "/home/yuri/eyetracking-mobile/node_modules/react-native-nitro-modules/android/build/intermediates/cxx/Debug/1w2w2w66/obj/armeabi-v7a/libNitroModules.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/yuri/eyetracking-mobile/node_modules/react-native-nitro-modules/android/build/headers/nitromodules"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

