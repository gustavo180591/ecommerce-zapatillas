import { toast } from 'svelte-sonner';
import { browser } from '$app/environment';

// Map internal status to user-friendly messages
const statusMessages: Record<string, { title: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }> = {
  // Success statuses
  'PAID': {
    title: 'Pago exitoso',
    message: 'Tu pago ha sido procesado correctamente.',
    type: 'success'
  },
  'COMPLETED': {
    title: 'Pedido completado',
    message: 'Tu pedido ha sido completado y será enviado pronto.',
    type: 'success'
  },
  'DELIVERED': {
    title: '¡Pedido entregado!',
    message: 'Tu pedido ha sido entregado con éxito.',
    type: 'success'
  },
  
  // Pending/Processing statuses
  'PENDING': {
    title: 'Pago pendiente',
    message: 'Estamos procesando tu pago. Te notificaremos cuando se complete.',
    type: 'info'
  },
  'PROCESSING': {
    title: 'Procesando',
    message: 'Tu pedido está siendo procesado.',
    type: 'info'
  },
  'SHIPPED': {
    title: 'En camino',
    message: '¡Tu pedido está en camino!',
    type: 'info'
  },
  
  // Error/Failure statuses
  'FAILED': {
    title: 'Pago fallido',
    message: 'Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.',
    type: 'error'
  },
  'CANCELLED': {
    title: 'Pedido cancelado',
    message: 'El pedido ha sido cancelado.',
    type: 'error'
  },
  'REFUNDED': {
    title: 'Reembolso procesado',
    message: 'Se ha procesado el reembolso de tu pago.',
    type: 'info'
  },
  'PARTIALLY_REFUNDED': {
    title: 'Reembolso parcial',
    message: 'Se ha procesado un reembolso parcial de tu pago.',
    type: 'info'
  },
  'DISPUTED': {
    title: 'Disputa de pago',
    message: 'Hay una disputa abierta para este pago. Nos pondremos en contacto contigo pronto.',
    type: 'warning'
  }
};

// Handle URL parameters for payment status
function handleUrlStatus() {
  if (!browser) return;
  
  const url = new URL(window.location.href);
  const status = url.searchParams.get('payment_status');
  const orderId = url.searchParams.get('order_id');
  
  if (status && status in statusMessages) {
    const { title, message, type } = statusMessages[status];
    
    // Show appropriate toast notification
    switch (type) {
      case 'success':
        toast.success(title, { description: message });
        break;
      case 'error':
        toast.error(title, { description: message });
        break;
      case 'warning':
        toast.warning(title, { description: message });
        break;
      default:
        toast(title, { description: message });
    }
    
    // Clean up URL
    url.searchParams.delete('payment_status');
    url.searchParams.delete('order_id');
    window.history.replaceState({}, '', url);
    
    return { status, orderId };
  }
  
  return null;
}

// Check payment status from the server
export async function checkPaymentStatus(orderId: string) {
  try {
    const response = await fetch(`/api/orders/${orderId}/status`);
    if (!response.ok) {
      throw new Error('Error al verificar el estado del pago');
    }
    
    const data = await response.json();
    return {
      status: data.status,
      paymentStatus: data.paymentStatus,
      updatedAt: new Date(data.updatedAt),
      ...(statusMessages[data.status] || {})
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {
      status: 'ERROR',
      paymentStatus: 'ERROR',
      title: 'Error',
      message: 'No se pudo verificar el estado del pago. Por favor, inténtalo más tarde.',
      type: 'error'
    };
  }
}

// Poll payment status until it's no longer pending
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pollPaymentStatus(orderId: string, onUpdate: (status: any) => void, interval = 5000) {
  let polling = true;
  
  const checkStatus = async () => {
    if (!polling) return;
    
    try {
      const status = await checkPaymentStatus(orderId);
      onUpdate(status);
      
      // Continue polling if still pending
      if (['PENDING', 'PROCESSING'].includes(status.status)) {
        setTimeout(checkStatus, interval);
      } else {
        polling = false;
      }
    } catch (error) {
      console.error('Polling error:', error);
      polling = false;
    }
  };
  
  // Initial check
  checkStatus();
  
  // Return function to stop polling
  return () => {
    polling = false;
  };
}

// Initialize payment status handling
export function initPaymentStatusHandling() {
  // Handle any status in URL parameters
  const urlStatus = handleUrlStatus();
  
  // Return status if found in URL
  if (urlStatus) {
    return urlStatus;
  }
  
  // Check for order ID in session storage (for page refreshes)
  if (browser) {
    const orderId = sessionStorage.getItem('currentOrderId');
    if (orderId) {
      return { orderId };
    }
  }
  
  return null;
}

// Save current order ID to session storage
export function setCurrentOrder(orderId: string) {
  if (browser) {
    sessionStorage.setItem('currentOrderId', orderId);
  }
}

// Clear current order from session storage
export function clearCurrentOrder() {
  if (browser) {
    sessionStorage.removeItem('currentOrderId');
  }
}

// Get user-friendly status message
export function getStatusMessage(status: string) {
  return statusMessages[status] || {
    title: 'Estado desconocido',
    message: 'No se pudo determinar el estado del pedido.',
    type: 'info'
  };
}
