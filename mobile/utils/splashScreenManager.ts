import * as SplashScreen from 'expo-splash-screen';

/**
 * Initialize the splash screen
 * This should be called in app entry point
 */
export async function initializeSplashScreen() {
  try {
    await SplashScreen.preventAutoHideAsync();
  } catch (e) {
    console.warn(`Failed to keep the splash screen visible: ${e}`);
  }
}

/**
 * Hide the splash screen when app is ready
 * Typically called after fonts load and initial setup completes
 */
export async function hideSplashScreen() {
  try {
    await SplashScreen.hideAsync();
  } catch (e) {
    console.warn(`Failed to hide the splash screen: ${e}`);
  }
}

/**
 * Show the splash screen again if needed
 * Useful for authentication flows or critical loading states
 */
export async function showSplashScreen() {
  try {
    await SplashScreen.showAsync();
  } catch (e) {
    console.warn(`Failed to show the splash screen: ${e}`);
  }
}
