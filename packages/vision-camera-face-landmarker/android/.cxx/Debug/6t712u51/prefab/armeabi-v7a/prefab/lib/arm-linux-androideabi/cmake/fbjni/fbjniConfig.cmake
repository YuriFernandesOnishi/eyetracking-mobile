if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "/home/yuri/.gradle/caches/9.3.1/transforms/dd29849c799951ad0680f4b910344724/transformed/fbjni-0.7.0/prefab/modules/fbjni/libs/android.armeabi-v7a/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/yuri/.gradle/caches/9.3.1/transforms/dd29849c799951ad0680f4b910344724/transformed/fbjni-0.7.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

