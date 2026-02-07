package com.yashodhan.dlr;

import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;
import android.webkit.MimeTypeMap;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

@CapacitorPlugin(name = "FileDownloader")
public class FileDownloaderPlugin extends Plugin {

    @PluginMethod
    public void download(PluginCall call) {
        String base64 = call.getString("data");
        String filename = call.getString("filename");
        String mimeType = call.getString("mimeType");

        if (base64 == null || filename == null) {
            call.reject("Missing data or filename");
            return;
        }

        try {
            // Remove data URI prefix if present
            if (base64.contains(",")) {
                base64 = base64.split(",")[1];
            }

            byte[] data = Base64.decode(base64, Base64.DEFAULT);
            Uri fileUri = saveFile(data, filename, mimeType);

            if (fileUri != null) {
                // Open the file
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setDataAndType(fileUri, mimeType);
                intent.setFlags(Intent.FLAG_ACTIVITY_NO_HISTORY | Intent.FLAG_GRANT_READ_URI_PERMISSION);

                // Create chooser
                Intent chooser = Intent.createChooser(intent, "Open File");
                getContext().startActivity(chooser);

                call.resolve();
            } else {
                call.reject("Failed to save file");
            }

        } catch (Exception e) {
            Log.e("FileDownloader", "Error", e);
            call.reject(e.getMessage());
        }
    }

    private Uri saveFile(byte[] data, String filename, String mimeType) throws IOException {
        Context context = getContext();
        Uri uri = null;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
            values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

            uri = context.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);

            if (uri != null) {
                try (OutputStream os = context.getContentResolver().openOutputStream(uri)) {
                    if (os != null) {
                        os.write(data);
                        return uri;
                    }
                }
            }
        } else {
            // Legacy storage (Pre-Android 10)
            File path = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            File file = new File(path, filename);
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(data);
                return Uri.fromFile(file);
            }
        }
        return null;
    }
}
