import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import PickingScreen from '../screens/PickingScreen';
import PackedScreen from '../screens/PackedScreen';
import DispatchedScreen from '../screens/DispatchedScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false
                }}
            >
                {/* Auth Screens */}
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

                {/* App Screens */}
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Picking" component={PickingScreen} />
                <Stack.Screen name="Packed" component={PackedScreen} />
                <Stack.Screen name="Dispatched" component={DispatchedScreen} />
                <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
