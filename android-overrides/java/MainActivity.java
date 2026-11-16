package com.apkpro.snn;

import android.Manifest;
import android.app.DownloadManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.DownloadListener;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_CODE = 1042;
    private static final int GEO_PERMISSION_REQUEST_CODE = 1043;
    private PermissionRequest pendingWebPermissionRequest;
    private String pendingGeoOrigin;
    private GeolocationPermissions.Callback pendingGeoCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureEdgeToEdgeFullscreen();
        requestRequiredRuntimePermissions();
        configureWebViewCapabilities();
    }

    private void configureEdgeToEdgeFullscreen() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (controller != null) {
            controller.setSystemBarsBehavior(
                    WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            );
            controller.hide(WindowInsetsCompat.Type.systemBars());
        }
    }

    private void addPermissionIfMissing(List<String> needed, String permission) {
        if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
            needed.add(permission);
        }
    }

    private void requestRequiredRuntimePermissions() {
        List<String> needed = new ArrayList<>();
        addPermissionIfMissing(needed, Manifest.permission.CAMERA);
        addPermissionIfMissing(needed, Manifest.permission.RECORD_AUDIO);
        addPermissionIfMissing(needed, Manifest.permission.ACCESS_FINE_LOCATION);
        addPermissionIfMissing(needed, Manifest.permission.ACCESS_COARSE_LOCATION);

        if (Build.VERSION.SDK_INT >= 33) {
            addPermissionIfMissing(needed, Manifest.permission.READ_MEDIA_IMAGES);
            addPermissionIfMissing(needed, Manifest.permission.READ_MEDIA_VIDEO);
            addPermissionIfMissing(needed, Manifest.permission.READ_MEDIA_AUDIO);
        } else {
            addPermissionIfMissing(needed, Manifest.permission.READ_EXTERNAL_STORAGE);
            if (Build.VERSION.SDK_INT <= 29) {
                addPermissionIfMissing(needed, Manifest.permission.WRITE_EXTERNAL_STORAGE);
            }
        }

        if (!needed.isEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }
    }

    private void configureWebViewCapabilities() {
        if (this.bridge == null || this.bridge.getWebView() == null) return;
        WebView webView = this.bridge.getWebView();
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setGeolocationEnabled(true);

        webView.addJavascriptInterface(new AndroidNativeBridge(), "AndroidNativeBridge");

        webView.setWebChromeClient(new BridgeWebChromeClient(this.bridge) {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    List<String> missingPermissions = new ArrayList<>();
                    String[] resources = request.getResources();
                    if (resources != null) {
                        for (String res : resources) {
                            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(res)) {
                                if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA)
                                        != PackageManager.PERMISSION_GRANTED) {
                                    missingPermissions.add(Manifest.permission.CAMERA);
                                }
                            } else if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(res)) {
                                if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO)
                                        != PackageManager.PERMISSION_GRANTED) {
                                    missingPermissions.add(Manifest.permission.RECORD_AUDIO);
                                }
                            }
                        }
                    }

                    if (missingPermissions.isEmpty()) {
                        request.grant(resources);
                    } else {
                        pendingWebPermissionRequest = request;
                        ActivityCompat.requestPermissions(
                                MainActivity.this,
                                missingPermissions.toArray(new String[0]),
                                PERMISSION_REQUEST_CODE
                        );
                    }
                });
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(final String origin,
                                                           final GeolocationPermissions.Callback callback) {
                runOnUiThread(() -> {
                    boolean hasFine = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_FINE_LOCATION)
                            == PackageManager.PERMISSION_GRANTED;
                    boolean hasCoarse = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_COARSE_LOCATION)
                            == PackageManager.PERMISSION_GRANTED;
                    if (hasFine || hasCoarse) {
                        callback.invoke(origin, true, false);
                    } else {
                        pendingGeoOrigin = origin;
                        pendingGeoCallback = callback;
                        ActivityCompat.requestPermissions(
                                MainActivity.this,
                                new String[]{
                                        Manifest.permission.ACCESS_FINE_LOCATION,
                                        Manifest.permission.ACCESS_COARSE_LOCATION
                                },
                                GEO_PERMISSION_REQUEST_CODE
                        );
                    }
                });
            }
        });

        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition,
                                        String mimeType, long contentLength) {
                if (url == null) return;
                if (url.startsWith("blob:")) {
                    String safeMime = (mimeType != null && !mimeType.isEmpty()) ? mimeType : "application/octet-stream";
                    String js = "fetch('" + url + "').then(r=>r.blob()).then(b=>{"
                            + "var fr=new FileReader();"
                            + "fr.onloadend=()=>window.AndroidNativeBridge.saveBase64File(fr.result,'download_' + Date.now(),b.type||'" + safeMime + "');"
                            + "fr.readAsDataURL(b);});";
                    webView.evaluateJavascript(js, null);
                } else if (url.startsWith("data:")) {
                    new AndroidNativeBridge().saveBase64File(url, "file_" + System.currentTimeMillis() + ".png", mimeType);
                } else if (url.startsWith("http://") || url.startsWith("https://")) {
                    try {
                        DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
                        String guessedName = URLUtil.guessFileName(url, contentDisposition, mimeType);
                        req.setMimeType(mimeType);
                        if (userAgent != null) req.addRequestHeader("User-Agent", userAgent);
                        req.setTitle(guessedName);
                        req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                        req.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, guessedName);
                        DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                        if (dm != null) {
                            dm.enqueue(req);
                            runOnUiThread(() -> Toast.makeText(MainActivity.this, "بدأ تنزيل الملف...", Toast.LENGTH_SHORT).show());
                        }
                    } catch (Exception ignored) {
                        // Fallback silently if DownloadManager rejects non-standard link
                    }
                }
            }
        });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE && pendingWebPermissionRequest != null) {
            boolean allGranted = grantResults.length > 0;
            for (int res : grantResults) {
                if (res != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            if (allGranted) {
                pendingWebPermissionRequest.grant(pendingWebPermissionRequest.getResources());
            } else {
                pendingWebPermissionRequest.deny();
            }
            pendingWebPermissionRequest = null;
        } else if (requestCode == GEO_PERMISSION_REQUEST_CODE && pendingGeoCallback != null) {
            boolean granted = false;
            for (int res : grantResults) {
                if (res == PackageManager.PERMISSION_GRANTED) {
                    granted = true;
                    break;
                }
            }
            pendingGeoCallback.invoke(pendingGeoOrigin, granted, false);
            pendingGeoOrigin = null;
            pendingGeoCallback = null;
        }
    }

    public class AndroidNativeBridge {
        @JavascriptInterface
        public void saveBase64File(String dataUrl, String fileName, String mimeType) {
            try {
                String cleanBase64 = dataUrl.contains(",") ? dataUrl.split(",", 2)[1] : dataUrl;
                byte[] bytes = Base64.decode(cleanBase64, Base64.DEFAULT);
                String safeMime = (mimeType != null && !mimeType.isEmpty()) ? mimeType : "image/png";
                boolean isImage = safeMime.startsWith("image/");

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
                    values.put(MediaStore.MediaColumns.MIME_TYPE, safeMime);
                    values.put(
                            MediaStore.MediaColumns.RELATIVE_PATH,
                            isImage ? Environment.DIRECTORY_PICTURES : Environment.DIRECTORY_DOWNLOADS
                    );
                    Uri collection = isImage
                            ? MediaStore.Images.Media.EXTERNAL_CONTENT_URI
                            : MediaStore.Downloads.EXTERNAL_CONTENT_URI;
                    Uri itemUri = getContentResolver().insert(collection, values);
                    if (itemUri != null) {
                        try (OutputStream out = getContentResolver().openOutputStream(itemUri)) {
                            if (out != null) out.write(bytes);
                        }
                    }
                } else {
                    File dir = Environment.getExternalStoragePublicDirectory(
                            isImage ? Environment.DIRECTORY_PICTURES : Environment.DIRECTORY_DOWNLOADS
                    );
                    if (!dir.exists()) dir.mkdirs();
                    File target = new File(dir, fileName);
                    try (FileOutputStream fos = new FileOutputStream(target)) {
                        fos.write(bytes);
                    }
                }
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "تم الحفظ في الاستوديو بنجاح", Toast.LENGTH_SHORT).show());
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "تعذر حفظ الملف", Toast.LENGTH_SHORT).show());
            }
        }

        @JavascriptInterface
        public void shareContent(String title, String text, String dataUrl, String mimeType) {
            try {
                Intent intent = new Intent(Intent.ACTION_SEND);
                if (dataUrl != null && !dataUrl.isEmpty()) {
                    String cleanBase64 = dataUrl.contains(",") ? dataUrl.split(",", 2)[1] : dataUrl;
                    byte[] bytes = Base64.decode(cleanBase64, Base64.DEFAULT);
                    File cacheFile = new File(getCacheDir(), "share_" + System.currentTimeMillis() + ".png");
                    try (FileOutputStream fos = new FileOutputStream(cacheFile)) {
                        fos.write(bytes);
                    }
                    Uri contentUri = FileProvider.getUriForFile(
                            MainActivity.this,
                            getPackageName() + ".fileprovider",
                            cacheFile
                    );
                    intent.setType(mimeType != null && !mimeType.isEmpty() ? mimeType : "image/png");
                    intent.putExtra(Intent.EXTRA_STREAM, contentUri);
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                } else {
                    intent.setType("text/plain");
                }
                if (title != null && !title.isEmpty()) intent.putExtra(Intent.EXTRA_SUBJECT, title);
                if (text != null && !text.isEmpty()) intent.putExtra(Intent.EXTRA_TEXT, text);
                runOnUiThread(() -> startActivity(Intent.createChooser(intent, title != null ? title : "مشاركة")));
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "تعذر فتح نافذة المشاركة", Toast.LENGTH_SHORT).show());
            }
        }
    }
}
