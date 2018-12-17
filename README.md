# Booking Delivery-ReactNative

this is guideline for build and run Bargain app from scratch

## Prerequirements

```sh
git clone https://github.com/MobileDev418/BookingApp-React-Native.git
```

**Warning:** On your simulator, To test the app will require you to have an [Xcode and/or Android Studio environment](https://facebook.github.io/react-native/docs/getting-started.html) set up.

## Getting Started

Running application

```sh
$ npm install
$ npm start
```

After running the Simulator or connected the Device
```sh
$ react-native run-android
or
$ react-native run-ios
```

## How to create signed apk

### Generating a signing key

First you should generate keystore file from 'keytool'. On Windows keytool must be run from C:\Program Files\Java\jdkx.x.x_x\bin.
```sh
$ keytool -genkey -v -keystore my-release-key.keystore -alias my-release-alias -keyalg RSA -keysize 2048 -validity 10000
```
It then generates the keystore as a file called 'kidney-key.keystore'.

### Setting up gradle variables

- Place the kidney-key.keystore file under the android/app directory in your project folder.
- Edit the file android/gradle.properties and add the following:

```sh 
MYAPP_RELEASE_STORE_FILE=******.keystore or ******.jks (keystore name)
MYAPP_RELEASE_KEY_ALIAS=******
MYAPP_RELEASE_STORE_PASSWORD=******
MYAPP_RELEASE_KEY_PASSWORD=******
```
### Adding signing config to your app's gradle config

Edit the file android/app/build.gradle in your project folder and add the signing config,

```sh
...
android {
    ...
    defaultConfig { ... }
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
...
```

### Generating the release APK

Simply run the following in a terminal:
```sh
cd android
./gradlew clean
./gradlew assembleRelease
```

The generated APK can be found under android/app/build/outputs/apk/app-release.apk, and is ready to be distributed.

**Warning:** Reference document [Generate Signed APK]
https://facebook.github.io/react-native/docs/signed-apk-android.html

###

### Change Package Name
I've changed project' subfolder name from: "android/app/src/main/java/MY/APP/OLD_ID/" to: "android/app/src/main/java/MY/APP/NEW_ID/"

Then manually switched the old and new package ids:

In: android/app/src/main/java/MY/APP/NEW_ID/MainActivity.java:

package MY.APP.NEW_ID;
In android/app/src/main/java/MY/APP/NEW_ID/MainApplication.java:

package MY.APP.NEW_ID;
In android/app/src/main/AndroidManifest.xml:

package="MY.APP.NEW_ID"
And in android/app/build.gradle:

applicationId "MY.APP.NEW_ID"
(Optional) In android/app/BUCK:

android_build_config(
  package="MY.APP.NEW_ID"
)
android_resource(
  package="MY.APP.NEW_ID"
)
Gradle' cleaning in the end (in /android folder):

./gradlew clean

## Unable to load script from assets ...
atest React-Native Cli fallow below Command in mac terminal run on android device
### step1: 
If not than (in project directory) 
`mkdir android/app/src/main/assets`

### step2: 
`react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
step3: react-native run-android`

