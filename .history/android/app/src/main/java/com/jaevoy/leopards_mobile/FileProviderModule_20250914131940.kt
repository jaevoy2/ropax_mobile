package com.jaevoy.leopards_mobile

import android.net.Uri
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*

import java.io.File

class FileProviderModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "FileProviderModule"
    }

    @ReactMethod
    fun getUri(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)
            val uri: Uri = FileProvider.getUriForFile(
                reactContext,
                reactContext.packageName + ".provider",
                file
            )
            promise.resolve(uri.toString())
        } catch (e: Exception) {
            promise.reject("FILE_ERROR", e)
        }
    }
}
