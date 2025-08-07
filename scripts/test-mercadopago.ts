import { createMercadoPagoClient } from '../src/lib/utils/mercadopago';

async function testMercadoPago() {
  // Get access token from environment variables
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('Error: MERCADOPAGO_ACCESS_TOKEN environment variable is not set');
    process.exit(1);
  }

  try {
    console.log('Initializing MercadoPago client...');
    const mp = createMercadoPagoClient(accessToken);

    // Test getting payment methods
    console.log('Fetching available payment methods...');
    const paymentMethods = await mp.getPaymentMethods();
    console.log('Available payment methods:', paymentMethods.map((p: any) => ({
      id: p.id,
      name: p.name,
      payment_type_id: p.payment_type_id,
      thumbnail: p.thumbnail
    })));

    console.log('\nMercadoPago integration test completed successfully!');
  } catch (error) {
    console.error('Error testing MercadoPago integration:', error);
    process.exit(1);
  }
}

// Run the test
testMercadoPago();
