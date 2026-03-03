import { getAuthenticatedClient } from './sanity.client';

/**
 * Verifica si el usuario es superadmin. Usar en APIs protegidas.
 * @param userId - Firebase UID del usuario (header x-user-id)
 * @returns true si es superadmin, false en caso contrario
 */
export async function isSuperadmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const client = getAuthenticatedClient();
  const user = await client.fetch<{ role?: string }>(
    `*[_type == "user" && firebaseUid == $uid][0]{ role }`,
    { uid: userId }
  );
  return user?.role === 'superadmin';
}
