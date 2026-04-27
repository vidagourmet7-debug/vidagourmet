import type { CarritoItem, CarritoOpcion } from '@/types';

// Pricing utilities for Vida Gourmet

export const PRECIOS_MENU_SEMANAL = {
  menor10: 8500,
  de10a13: 8000,
  mas14: 7500,
};

export const PRECIO_MENU_PROTEICO = 10000;

export const UMBRAL_ENVIO_GRATIS_UNIDADES = 14;
export const UMBRAL_ENVIO_GRATIS_MONTO = 105000;
export const COSTO_ENVIO = 2000;

// Calculate price per unit for Menu Semanal based on total quantity
export function calcularPrecioUnitarioSemanal(cantidadTotal: number): number {
  if (cantidadTotal < 10) return PRECIOS_MENU_SEMANAL.menor10;
  if (cantidadTotal < 14) return PRECIOS_MENU_SEMANAL.de10a13;
  return PRECIOS_MENU_SEMANAL.mas14;
}

// Calculate shipping cost based on total units and subtotal
export function calcularEnvio(unidadesTotales: number, subtotal: number): number {
  if (unidadesTotales >= UMBRAL_ENVIO_GRATIS_UNIDADES || subtotal >= UMBRAL_ENVIO_GRATIS_MONTO) {
    return 0;
  }
  return COSTO_ENVIO;
}

// Calculate total units in cart (for shipping calculation)
export function calcularUnidadesTotales(
  opcionesSemanal: CarritoOpcion[],
  opcionesProteico: CarritoOpcion[],
  productos: CarritoItem[]
): number {
  const semanalUnits = opcionesSemanal.reduce((acc, item) => acc + item.cantidad, 0);
  const proteicoUnits = opcionesProteico.reduce((acc, item) => acc + item.cantidad, 0);
  const productoUnits = productos.reduce((acc, item) => {
    // Canastitas/Empanadas are sold in packs of 6 but count as 1 unit for shipping
    return acc + item.cantidad;
  }, 0);
  return semanalUnits + proteicoUnits + productoUnits;
}

// Get next tier info for menu semanal
export function getSiguienteEscalonSemanal(cantidadActual: number): { unidades: number; precio: number } | null {
  if (cantidadActual < 10) {
    return { unidades: 10 - cantidadActual, precio: PRECIOS_MENU_SEMANAL.de10a13 };
  }
  if (cantidadActual < 14) {
    return { unidades: 14 - cantidadActual, precio: PRECIOS_MENU_SEMANAL.mas14 };
  }
  return null;
}