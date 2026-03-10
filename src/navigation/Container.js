import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
import { restoreAuthSession } from '../services/authService';

const Stack = createNativeStackNavigator();

export default function App() {
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [initialRouteName, setInitialRouteName] = useState('Login');

    useEffect(() => {
        let isMounted = true;

        const bootstrap = async () => {
            try {
                const token = await restoreAuthSession();
                if (isMounted && token) {
                    setInitialRouteName('Home');
                }
            } finally {
                if (isMounted) {
                    setIsBootstrapping(false);
                }
            }
        };

        bootstrap();

        return () => {
            isMounted = false;
        };
    }, []);

    if (isBootstrapping) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#C93D14" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={initialRouteName}
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
