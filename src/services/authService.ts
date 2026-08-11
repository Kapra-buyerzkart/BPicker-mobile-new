import AsyncStorage from '@react-native-async-storage/async-storage';
import httpClient, { setAuthToken, setRefreshTokenHandler } from './httpClient';
import type {
  ApiEnvelope,
  ChangePasswordParams,
  LoginCredentials,
  PickerProfile,
  RawRecord,
  StoredUser,
} from '../types/api';

const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: '@picker/access_token',
  REFRESH_TOKEN: '@picker/refresh_token',
  USER: '@picker/user',
} as const;

interface PersistAuthDataParams {
  accessToken?: string;
  refreshToken?: string;
  userData?: RawRecord;
}

const persistAuthData = async ({
  accessToken,
  refreshToken,
  userData,
}: PersistAuthDataParams): Promise<void> => {
  const existingUser = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER);
  const parsedExistingUser: StoredUser = existingUser
    ? JSON.parse(existingUser)
    : {};
  const mergedUser: StoredUser = {
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

export const loginPickerAgent = async ({
  phone,
  password,
}: LoginCredentials): Promise<ApiEnvelope<RawRecord>> => {
  const response = await httpClient.post<ApiEnvelope<RawRecord>>(
    '/pickeragent/auth/login',
    {
      phone,
      password,
    }
  );

  if (!response?.data?.success) {
    throw new Error(response?.data?.message || 'Login failed');
  }

  const userData = response.data?.data || {};
  const accessToken = userData.accessToken || '';
  const refreshToken = userData.refreshToken || '';

  await persistAuthData({ accessToken, refreshToken, userData });

  return response.data;
};

export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = await AsyncStorage.getItem(
    AUTH_STORAGE_KEYS.REFRESH_TOKEN
  );

  if (!refreshToken) {
    throw new Error('Refresh token not found');
  }

  const response = await httpClient.post<ApiEnvelope<RawRecord>>(
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

export const restoreAuthSession = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    setAuthToken(token);
  }
  return token;
};

export const getStoredUser = async (): Promise<StoredUser | null> => {
  const userValue = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER);
  if (!userValue) {
    return null;
  }

  try {
    return JSON.parse(userValue) as StoredUser;
  } catch {
    return null;
  }
};

export const getPickerProfile = async (): Promise<PickerProfile> => {
  const response = await httpClient.get<ApiEnvelope<RawRecord>>(
    '/pickeragent/profile'
  );

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

export const changePickerPassword = async ({
  oldpassword,
  newpassword,
}: ChangePasswordParams): Promise<ApiEnvelope> => {
  const response = await httpClient.post<ApiEnvelope>(
    '/pickeragent/changepassword',
    {
      oldpassword,
      newpassword,
    }
  );

  if (!response?.data?.success) {
    throw new Error(response?.data?.message || 'Unable to change password');
  }

  return response.data;
};

export const logoutPickerAgent = async (): Promise<void> => {
  try {
    await httpClient.post('/auth/logout', {}, { skipAuthRefresh: true });
  } catch {
  }

  await AsyncStorage.multiRemove([
    AUTH_STORAGE_KEYS.ACCESS_TOKEN,
    AUTH_STORAGE_KEYS.REFRESH_TOKEN,
    AUTH_STORAGE_KEYS.USER,
  ]);
  setAuthToken('');
};

setRefreshTokenHandler(refreshAccessToken);
