import { env } from '../config/env';
import { matchesDomain } from './emailDomain';

export const ACCESS_RESTRICTED_MESSAGE =
  'Access restricted. Please login using your official domain email.';

/** True only when the email belongs exactly to the configured domain (default hbplus.fit). */
export function isAllowedEmail(
  email: string | null | undefined,
  allowedDomain: string = env.allowedDomain,
): boolean {
  return matchesDomain(email, allowedDomain);
}

export function isBootstrapAdmin(email: string | null | undefined): boolean {
  return !!email && env.adminEmails.includes(email.trim().toLowerCase());
}
