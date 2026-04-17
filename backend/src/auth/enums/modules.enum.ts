/**
 * Module Enum for Access Control
 *
 * Admins and Vendors can be given access to specific modules.
 * This enum defines all available modules in the drug testing system.
 */

export const MODULES = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  VENDORS: 'vendors',
  DRIVERS: 'drivers',
  DRUG_TESTS: 'drugTests',
  REPORTS: 'reports',
  SETTINGS: 'settings',
} as const;

export type Module = (typeof MODULES)[keyof typeof MODULES];

/**
 * Module display names for UI
 */
export const MODULE_DISPLAY_NAMES: Record<Module, string> = {
  [MODULES.DASHBOARD]: 'Dashboard',
  [MODULES.USERS]: 'Users',
  [MODULES.VENDORS]: 'Vendors',
  [MODULES.DRIVERS]: 'Drivers',
  [MODULES.DRUG_TESTS]: 'Drug Tests',
  [MODULES.REPORTS]: 'Reports',
  [MODULES.SETTINGS]: 'Settings',
};

/**
 * Default permissions for new users
 */
export const DEFAULT_MODULE_PERMISSIONS: Record<Module, boolean> = {
  [MODULES.DASHBOARD]: false,
  [MODULES.USERS]: false,
  [MODULES.VENDORS]: false,
  [MODULES.DRIVERS]: false,
  [MODULES.DRUG_TESTS]: false,
  [MODULES.REPORTS]: false,
  [MODULES.SETTINGS]: false,
};

/**
 * Admin permissions - all enabled
 */
export const ADMIN_MODULE_PERMISSIONS: Record<Module, boolean> = {
  [MODULES.DASHBOARD]: true,
  [MODULES.USERS]: true,
  [MODULES.VENDORS]: true,
  [MODULES.DRIVERS]: true,
  [MODULES.DRUG_TESTS]: true,
  [MODULES.REPORTS]: true,
  [MODULES.SETTINGS]: true,
};

/**
 * Vendor default permissions
 */
export const VENDOR_MODULE_PERMISSIONS: Record<Module, boolean> = {
  [MODULES.DASHBOARD]: true,
  [MODULES.USERS]: false,
  [MODULES.VENDORS]: false,
  [MODULES.DRIVERS]: true,
  [MODULES.DRUG_TESTS]: true,
  [MODULES.REPORTS]: true,
  [MODULES.SETTINGS]: false,
};
