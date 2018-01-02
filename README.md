# Booking Delivery-ReactNative

this is guideline for build and run Bargain app from scratch

===========================================

# Screenshots
<div style="display:inline-block">
<img src="https://firebasestorage.googleapis.com/v0/b/fir-test-a3cb2.appspot.com/o/bargainbook%2Fsign.png?alt=media&token=c73589e1-336c-4749-85cb-6e3e8ecd2cdc" width="178" height="350" style="margin-left:20px" />
<img src="https://firebasestorage.googleapis.com/v0/b/testpro-1f6d3.appspot.com/o/pepperjelly3.png?alt=media&token=40b29fbf-3d26-4f7a-8ac9-a99c0b8c9ec2" width="178" height="350" style="margin-left:20px"/>
<img src="https://firebasestorage.googleapis.com/v0/b/testpro-1f6d3.appspot.com/o/pepperjelly4.png?alt=media&token=f5e302e0-f1fb-4c7a-a2b0-14e8d27743de" width="178" height="350" style="margin-left:20px"/>
<img src="https://firebasestorage.googleapis.com/v0/b/fir-test-a3cb2.appspot.com/o/bargainbook%2FImage%2011.png?alt=media&token=172f5c15-56c5-40cc-92ed-394dfe5fbf77" width="178" height="350" />

<div>


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
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-release-alias
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

