
import React from 'react';

export const SYSTEM_DEFAULTS = {
  get MANAGER_PIN() {
    return localStorage.getItem('nexus_manager_pin') || '1234';
  },
  TERMINAL_PREFIX: 'T-REG-',
  TAX_RATE: 0.08
};

/**
 * PRODUCTION READY: System starts with zero data.
 * Store managers will populate these records in their local vault.
 */
export const MOCK_PRODUCTS: any[] = [];
export const MOCK_CUSTOMERS: any[] = [];
export const MOCK_STAFF: any[] = [];
