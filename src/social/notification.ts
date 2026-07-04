import type { ISocialProvider, SocialNotification } from './provider';

export class NotificationManager {
  /**
   * Retrieves notifications for the logged in user.
   */
  public static async getNotifications(address: string, provider: ISocialProvider): Promise<SocialNotification[]> {
    return await provider.getNotifications(address);
  }
}
