package com.yourapp;

import android.net.Uri;
import android.content.Context;
import androidx.core.content.FileProvider;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.io.File;

public class FileProviderModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;

  public FileProviderModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "FileProviderModule";
  }

  @ReactMethod
  public void getUri(String filePath, Promise promise) {
    try {
      Context context = getReactApplicationContext();
      File file = new File(filePath);
      Uri uri = FileProvider.getUriForFile(context, context.getPackageName() + ".provider", file);
      promise.resolve(uri.toString());
    } catch (Exception e) {
      promise.reject("ERROR", e);
    }
  }
}
