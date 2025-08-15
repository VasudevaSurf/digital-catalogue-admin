export const smsService = {
  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    // In production, integrate with actual SMS service (Twilio, MSG91, etc.)
    console.log(`Sending OTP ${otp} to ${phoneNumber}`);

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  },

  async sendOrderConfirmation(
    phoneNumber: string,
    orderId: string
  ): Promise<boolean> {
    console.log(`Sending order confirmation for ${orderId} to ${phoneNumber}`);
    return true;
  },

  async sendStatusUpdate(
    phoneNumber: string,
    orderId: string,
    status: string
  ): Promise<boolean> {
    console.log(
      `Sending status update for ${orderId} to ${phoneNumber}: ${status}`
    );
    return true;
  },
};
