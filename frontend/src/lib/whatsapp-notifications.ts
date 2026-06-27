import { sendReplyButtons, sendWhatsAppMessage } from '@/lib/whatsapp';

export async function notifyOrderAccepted(customerPhone: string, orderId: string, vendorName: string) {
  await sendWhatsAppMessage(
    customerPhone,
    `✅ *Order Confirmed!*\n\nYour order *${orderId}* has been accepted by *${vendorName}*.\n\nWe'll notify you when it's delivered. 💧`,
  );
}

export async function notifyOrderDelivered(customerPhone: string, orderId: string, vendorName: string) {
  await sendWhatsAppMessage(
    customerPhone,
    `💧 *Your order has been delivered!*\n\nOrder *${orderId}* from *${vendorName}* is complete. Thank you!\n\n_Send "Hi" to begin your next order._`,
  );
}

export async function notifyDeliveryFailed(customerPhone: string, deliveryDate: string) {
  await sendReplyButtons(
    customerPhone,
    `⚠️ *Delivery Attempt Failed*\n\nWe're sorry — your delivery for *${deliveryDate}* could not be completed.\n\nYour order will be delivered tomorrow.`,
    [
      { id: 'failed_okay', title: '👍 Okay' },
      { id: 'failed_contact_vendor', title: '📞 Contact Vendor' },
    ],
  );
}

export async function notifyOrderPostponed(customerPhone: string, orderId: string, newDeliveryDate: string) {
  await sendWhatsAppMessage(
    customerPhone,
    `📅 *Delivery Rescheduled*\n\nYour order *${orderId}* has been moved to *${newDeliveryDate}*.\n\nWe're sorry for the delay!`,
  );
}

export async function notifyOrderCancelled(customerPhone: string, orderId: string, reason?: string | null) {
  await sendWhatsAppMessage(
    customerPhone,
    `❌ *Order Cancelled*\n\nYour order *${orderId}* has been cancelled by the vendor.${reason ? `\n\nReason: ${reason}` : ''}\n\n_Send "Hi" to place a new order._`,
  );
}

export async function notifyOrderCarriedForward(customerPhone: string, orderId: string, newDeliveryDate: string) {
  await sendWhatsAppMessage(
    customerPhone,
    `📅 *Delivery Update*\n\nWe couldn't deliver your order *${orderId}* as scheduled. It's now rescheduled for *${newDeliveryDate}*.\n\nSorry for the inconvenience!`,
  );
}
