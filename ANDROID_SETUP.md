# Android App Setup & Configuration Guide

## 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select your existing one.
3. Go to **APIs & Services > Credentials**.
4. Create **OAuth Client ID**:
   - **Application Type**: Web application (Yes, even for Capacitor, because Supabase uses the web flow).
   - **Authorized Redirect URIs**:
     - `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`
5. Copy the **Client ID** and **Client Secret**.

## 2. Supabase Dashboard Configuration
1. Go to your Supabase Project > **Authentication** > **Providers**.
2. Enable **Google**.
3. Paste the **Client ID** and **Client Secret** from Google.
4. Go to **Authentication** > **URL Configuration**.
5. Add the following to **Redirect URLs**:
   - `com.yashodhan.dlr://login-callback`

## 3. Build & Run
1. Sync changes (if you edit code):
   ```bash
   npm run build
   npx cap sync
   ```
2. Open in Android Studio:
   ```bash
   npx cap open android
   ```
3. In Android Studio:
   - Wait for Gradle sync to finish.
   - Connect a device or create an Emulator.
   - Click the **Run** button (green play icon).

## 4. Generating APK/AAB
- **Debug APK**: Run the app in Android Studio. APK is at `android/app/build/outputs/apk/debug/app-debug.apk`.
- **Signed Release**:
  - In Android Studio, go to **Build > Generate Signed Bundle / APK**.
  - Choose **Android App Bundle** (for Play Store) or **APK** (for direct install).
  - Create a new KeyStore path and password.
  - Select `release` build type.

## 5. App Icons & Splash
To generate icons strings:
1. Install utility: `npm install @capacitor/assets --save-dev`
2. Place `logo.png` (1024x1024) and `splash.png` (2732x2732) in a `resources` folder in root.
3. Run `npx capacitor-assets generate --android`.
