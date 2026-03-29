/**
 * Account feature public API.
 *
 * Usage:
 *   import { AccountPage, AccountSidebar } from '../../features/account';
 */

// Pages
export { AccountPage }    from '../../pages/AccountPage';

// Components
export { AccountSidebar } from '../../components/AccountSidebar';

// Skeletons — AccountSkeleton has no named export in skeletons/index.ts yet, re-export directly
export { default as AccountSkeleton } from '../../skeletons/AccountSkeleton';
