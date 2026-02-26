import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import PickingScreen from '../screens/PickingScreen';
import PackedScreen from '../screens/PackedScreen';
import DispatchedScreen from '../screens/DispatchedScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreenScreen from '../screens/ResetPasswordScreen';
import OtpScreen from '../screens/OtpScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs
function MainTabs() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Picking" component={PickingScreen} />
            <Tab.Screen name="Packed" component={PackedScreen} />
            <Tab.Screen name="Dispatched" component={DispatchedScreen} />
        </Tab.Navigator>
    );
}

// Main App
export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="Otp" component={OtpScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreenScreen} />
                <Stack.Screen name="MainTabs" component={MainTabs} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}