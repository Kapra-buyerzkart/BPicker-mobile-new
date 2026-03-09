import AsyncStorage from '@react-native-async-storage/async-storage';
import httpClient, { setAuthToken, setRefreshTokenHandler } from './httpClient';

const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: '@picker/access_token',
  REFRESH_TOKEN: '@picker/refresh_token',
  USER: '@picker/user',
};

const persistAuthData = async ({ accessToken, refreshToken, userData }) => {
  const existingUser = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER);
  const parsedExistingUser = existingUser ? JSON.parse(existingUser) : {};
  const mergedUser = {
    ...parsedExistingUser,
    ...(userData || {}),
    ...(accessToken ? { accessToken } : {}),
    ...(refreshToken ? { refreshToken } : {}),
  };

  await AsyncStorage.multiSet([
    [AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken || ''],
    [AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken || ''],
    [AUTH_STORAGE_KEYS.USER, JSON.stringify(mergedUser)],
  ]);

  setAuthToken(accessToken || '');
};

export const loginPickerAgent = async ({ phone, password }) => {
  const response = await httpClient.post('/pickeragent/auth/login', {
    phone,
    password,
  });

  if (!response?.data?.success) {
    throw new Error(response?.data?.message || 'Login failed');
  }

  const userData = response.data?.data || {};
  const accessToken = userData.accessToken || '';
  const refreshToken = userData.refreshToken || '';

  await persistAuthData({ accessToken, refreshToken, userData });

  return response.data;
};

export const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);

  if (!refreshToken) {
    throw new Error('Refresh token not found');
  }

  const response = await httpClient.post(
    '/auth/refreshtoken',
    { refreshToken },
    { skipAuthRefresh: true }
  );

  if (!response?.data?.success) {
    throw new Error(response?.data?.message || 'Token refresh failed');
  }

  const refreshedData = response.data?.data || {};
  const newAccessToken = refreshedData.accessToken || '';
  const newRefreshToken = refreshedData.refreshToken || refreshToken;

  await persistAuthData({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });

  return newAccessToken;
};

export const restoreAuthSession = async () => {
  const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    setAuthToken(token);
  }
  return token;
};

export const getStoredUser = async () => {
  const userValue = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER);
  if (!userValue) {
    return null;
  }

  try {
    return JSON.parse(userValue);
  } catch {
    return null;
  }
};

export const getPickerProfile = async () => {
  const response = await httpClient.get('/pickeragent/profile');

  if (!response?.data?.success) {
    throw new Error(response?.data?.message || 'Unable to fetch profile');
  }

  const profileData = response.data?.data || {};
  const storedUser = await getStoredUser();

  await AsyncStorage.setItem(
    AUTH_STORAGE_KEYS.USER,
    JSON.stringify({
      ...(storedUser || {}),
      ...profileData,
    })
  );

  return {
    fullName: profileData.fullName || '',
    emailId: profileData.emailId || '',
    phoneNo: String(profileData.phoneNo || ''),
    storeName: profileData.storeName || '',
  };
};

export const changePickerPassword = async ({ oldpassword, newpassword }) => {
  const response = await httpClient.post('/pickeragent/changepassword', {
    oldpassword,
    newpassword,
  });

  if (!response?.data?.success) {
    throw new Error(response?.data?.message || 'Unable to change password');
  }

  return response.data;
};

export const logoutPickerAgent = async () => {
  try {
    await httpClient.post('/auth/logout', {}, { skipAuthRefresh: true });
  } catch {
    // Even when API logout fails, clear local auth state to force sign-out.
  }

  await AsyncStorage.multiRemove([
    AUTH_STORAGE_KEYS.ACCESS_TOKEN,
    AUTH_STORAGE_KEYS.REFRESH_TOKEN,
    AUTH_STORAGE_KEYS.USER,
  ]);
  setAuthToken('');
};

setRefreshTokenHandler(refreshAccessToken);
