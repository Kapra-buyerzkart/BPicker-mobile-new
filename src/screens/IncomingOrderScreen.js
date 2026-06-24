import React, { useState } from 'react';
import IncomingOrderAlert from '../components/IncomingOrderAlert';
import { updateOrderStatus } from '../services/ordersService';
import { clearActiveIncomingOrder } from '../navigation/navigationRef';

const IncomingOrderScreen = ({ navigation, route }) => {
  const order = route?.params?.order;
  const [isVisible, setIsVisible] = useState(true);

  const dismiss = () => {
    clearActiveIncomingOrder();
    setIsVisible(false);
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('Home');
    }
  };

  const handleAccept = async (acceptedOrder) => {
    try {
      await updateOrderStatus({ orderId: acceptedOrder?.orderId, eventKey: 'ACCEPTED' });
    } catch {
      // Surfacing this failure is left to the existing order workflow screens;
      // we still dismiss so the rider isn't stuck behind an unresponsive alert.
    } finally {
      dismiss();
    }
  };

  const handleReject = async (rejectedOrder) => {
    try {
      await updateOrderStatus({ orderId: rejectedOrder?.orderId, eventKey: 'REJECTED' });
    } catch {
      // same rationale as handleAccept
    } finally {
      dismiss();
    }
  };

  const handleTimeout = async (timedOutOrder) => {
    try {
      await updateOrderStatus({ orderId: timedOutOrder?.orderId, eventKey: 'REJECTED' });
    } catch {
      // ignore - timeout dismissal should not block on network state
    } finally {
      dismiss();
    }
  };

  return (
    <IncomingOrderAlert
      visible={isVisible}
      order={order}
      onAccept={handleAccept}
      onReject={handleReject}
      onTimeout={handleTimeout}
    />
  );
};

export default IncomingOrderScreen;
