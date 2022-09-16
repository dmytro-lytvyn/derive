import React, { Fragment, FunctionComponent } from "react";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import router from "router";
import { StatusBar } from "expo-status-bar";

const Stack = createNativeStackNavigator();

const Application: FunctionComponent = () => {
  /** Load fonts */
  const [loadedFonts]: [boolean, Error | null] = useFonts({
    "Lato-Black": require("./assets/fonts/Lato-Black.ttf"),
    "Lato-Bold": require("./assets/fonts/Lato-Bold.ttf"),
    "Lato-Regular": require("./assets/fonts/Lato-Regular.ttf"),
  });

  /** Configure application */
  const AppTheme: typeof DefaultTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: "#161622" } };
  const StackScreenOptions: NativeStackNavigationOptions = {
    headerShown: false,
    animation: "fade",
    animationTypeForReplace: "push",
  };

  /** Render */
  if (!loadedFonts) return null;
  return (
    <Fragment>
      <StatusBar backgroundColor="#161622" style="light" />
      <NavigationContainer theme={AppTheme}>
        <Stack.Navigator>
          {router.map(route => {
            return (
              <Stack.Screen
                key={route.name}
                name={route.name}
                component={route.component}
                options={StackScreenOptions}
              />
            );
          })}
        </Stack.Navigator>
      </NavigationContainer>
    </Fragment>
  );
};

export default Application;
