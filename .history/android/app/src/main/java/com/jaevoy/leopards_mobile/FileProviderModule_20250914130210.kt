package com.yourapp

import android.content.Context
import android.net.Uri
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*

import java.io.File

class FileProviderModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "FileProviderModule"

    @ReactMethod
    fun getUri(filePath: String, promise: Promise) {
        try {
            val context: Context = reactApplicationContext
            val file = File(filePath)
            val authority = context.packageName + ".provider"
            val uri: Uri = FileProvider.getUriForFile(context, authority, file)
            promise.resolve(uri.toString())
        } catch (e: Exception) {
            promise.reject("FILE_ERROR", e)
        }
    }
}
