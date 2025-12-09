import 'dotenv/config';

export default {
  expo: {
    name: "leopards_mobile",
    slug: "leopards_mobile",
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
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.jaevoy.leopards_mobile"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
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
      API_URL: process.env.API_URL, 
      API_KEY: process.env.API_KEY,
      ORIGIN: process.env.ORIGIN,
      PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
      PUBLIC_ANON_KEY: process.env.PUBLIC_ANON_KEY
    }
  }
};
