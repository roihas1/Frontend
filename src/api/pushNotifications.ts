import axiosInstance from "./axiosInstance";

export interface PushSubscribePayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

export async function subscribePushNotification(
  payload: PushSubscribePayload,
): Promise<void> {
  await axiosInstance.post("/push-notifications/subscribe", payload);
}

export async function unsubscribePushNotification(
  endpoint: string,
): Promise<void> {
  await axiosInstance.delete("/push-notifications/subscribe", {
    data: { endpoint },
  });
}

/** True only when this browser endpoint is stored for the logged-in user. */
export async function getPushRegistrationStatus(
  endpoint: string,
): Promise<boolean> {
  const response = await axiosInstance.get<{ registered: boolean }>(
    "/push-notifications/status",
    { params: { endpoint } },
  );
  return Boolean(response.data?.registered);
}
