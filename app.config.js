import 'dotenv/config';

export default {
  expo: {
    name: "Leopards Ticketing",
    slug: "leopards-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "leopardsmobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icons/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.jaevoy.leopards_mobile",
      usesCleartextTraffic: true
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-audio",
      "expo-font",
      "expo-web-browser",
      [
        "expo-splash-screen",
        {
          image: "./assets/icons/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "436c6e76-2b93-4c33-b8d4-6fa2a149ce3f"
      },
      API_URL: process.env.API_URL, 
      API_KEY: process.env.API_KEY,
      ORIGIN: process.env.ORIGIN,
      PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
      PUBLIC_ANON_KEY: process.env.PUBLIC_ANON_KEY
    }
  },
};
