import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import {
    NavigationContainer,
    DefaultTheme,
    DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import PickingScreen from '../screens/PickingScreen';
import PackedScreen from '../screens/PackedScreen';
import DispatchedScreen from '../screens/DispatchedScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { getStoredUser, restoreAuthSession } from '../services/authService';
import { oneSignalLogin, requestPushPermissionIfNeeded } from '../services/oneSignalService';
import SplashScreen from '../components/SplashScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const { colors, isDark } = useTheme();
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [splashVisible, setSplashVisible] = useState(true);
    const [initialRouteName, setInitialRouteName] = useState('Login');

    const navigationTheme = useMemo(() => {
        const base = isDark ? DarkTheme : DefaultTheme;
        return {
            ...base,
            colors: {
                ...base.colors,
                background: colors.background,
                card: colors.card,
                text: colors.text,
                border: colors.border,
                primary: colors.primary,
                notification: colors.primary,
            },
        };
    }, [isDark, colors]);

    useEffect(() => {
        let isMounted = true;

        const bootstrap = async () => {
            try {
                const token = await restoreAuthSession();
                if (isMounted && token) {
                    const storedUser = await getStoredUser();
                    const pickerAgentId = storedUser?.pickerAgentId;
                    const custId = storedUser?.custId;
                    const phoneValue = String(storedUser?.phone || storedUser?.phoneNo || '').trim();
                    const externalId =
                        pickerAgentId != null && String(pickerAgentId).trim().length > 0
                            ? `cust-${custId != null ? String(custId).trim() : 'na'}-pickerAgent-${String(pickerAgentId).trim()}`
                            : (phoneValue ? `phone-${phoneValue}` : null);

                    if (externalId) {
                        const tags = {
                            custId: storedUser?.custId != null ? String(storedUser.custId) : '',
                            storeId: storedUser?.storeId != null ? String(storedUser.storeId) : '',
                            storeName: String(storedUser?.storeName || ''),
                            phone: String(storedUser?.phone || storedUser?.phoneNo || ''),
                        };
                        const nonEmptyTags = Object.fromEntries(
                            Object.entries(tags).filter(([, value]) => String(value).trim().length > 0)
                        );

                        oneSignalLogin({
                            externalId,
                            tags: Object.keys(nonEmptyTags).length > 0 ? nonEmptyTags : undefined,
                        });
                        requestPushPermissionIfNeeded();
                    }
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

    // Called when the splash exit animation finishes — unmount the overlay.
    const handleSplashComplete = useCallback(() => {
        setSplashVisible(false);
    }, []);

    // While bootstrapping, only show the splash screen.
    if (isBootstrapping) {
        return <SplashScreen isReady={false} onAnimationComplete={handleSplashComplete} />;
    }

    return (
        <View style={{ flex: 1 }}>
            <NavigationContainer theme={navigationTheme}>
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
            {splashVisible && (
                <SplashScreen isReady={true} onAnimationComplete={handleSplashComplete} />
            )}
        </View>
    );
}

