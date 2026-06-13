import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.getbilled",
  appName: "Swiftbill",
  webDir: "out",
  // IMPORTANT: Set this to your Vercel URL after deploying
  // The app loads your live web app — updates automatically apply to mobile too
  server: {
    url: "https://billed-alpha.vercel.app",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#08080f",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "Dark",
      backgroundColor: "#08080f",
    },
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#08080f",
  },
  android: {
    backgroundColor: "#08080f",
    allowMixedContent: false,
  },
};

export default config;
