import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { CreatePreferencePayload } from 'mercadopago/models/preferences/create-payload.model';

// Initialize MercadoPago client
export function createMercadoPagoClient(accessToken: string) {
  if (!accessToken) {
    throw new Error('MercadoPago access token is required');
  }

  const client = new MercadoPagoConfig({ 
    accessToken,
    options: { timeout: 5000 } // 5 seconds timeout
  });

  return {
    // Create a preference (payment)
    async createPreference(preference: CreatePreferencePayload) {
      try {
        const mpPreference = new Preference(client);
        return await mpPreference.create({ body: preference });
      } catch (error) {
        console.error('Error creating MercadoPago preference:', error);
        throw error;
      }
    },

    // Get payment by ID
    async getPayment(paymentId: string) {
      try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        return await response.json();
      } catch (error) {
        console.error('Error fetching payment:', error);
        throw error;
      }
    },

    // Get payment methods
    async getPaymentMethods() {
      try {
        const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        return await response.json();
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        throw error;
      }
    }
  };
}

export type MercadoPagoClient = ReturnType<typeof createMercadoPagoClient>;
