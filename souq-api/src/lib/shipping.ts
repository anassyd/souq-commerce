/** Cents. Free delivery at or above FREE_SHIPPING, otherwise SHIPPING_FEE. */
export const FREE_SHIPPING = 5000;
export const SHIPPING_FEE = 499;
export const shippingFor = (subtotal: number) => (subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE);
