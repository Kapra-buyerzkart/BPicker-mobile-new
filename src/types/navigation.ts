import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type OrderDetailsMode = 'view' | 'edit';

export type RootStackParamList = {
  Login: undefined;
  ChangePassword: undefined;
  Home: { storeName?: string } | undefined;
  Picking: undefined;
  Packed: undefined;
  Dispatched: undefined;
  OrderDetails: {
    orderId?: number | string;
    orderNumber?: string;
    mode?: OrderDetailsMode;
  };
  Profile: undefined;
};

export type RootStackScreenProps<TRoute extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, TRoute>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
