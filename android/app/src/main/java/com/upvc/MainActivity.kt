package com.upvc

import android.app.ActivityManager
import android.graphics.BitmapFactory
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "UPVC"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    // Set recent apps thumbnail header color to white to avoid logo overlap appearance
    setTaskDescription(
      ActivityManager.TaskDescription(
        "UPVC Connect",
        null,
        0xFFFFFFFF.toInt() // white background for recent apps header
      )
    )
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
