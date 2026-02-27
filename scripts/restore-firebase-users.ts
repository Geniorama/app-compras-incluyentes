/**
 * Script para restaurar usuarios de Firebase que fueron borrados por error
 * por el webhook pero siguen existiendo en Sanity.
 *
 * Uso:
 *   npx tsx scripts/restore-firebase-users.ts
 *   # o con variables de entorno explícitas:
 *   npx tsx scripts/restore-firebase-users.ts
 *
 * Requiere: .env.local con FIREBASE_ADMIN_*, NEXT_PUBLIC_SANITY_*, SANITY_API_TOKEN
 *
 * El script:
 * 1. Obtiene todos los usuarios de Sanity con firebaseUid (excluye miembros)
 * 2. Verifica si cada uno existe en Firebase Auth
 * 3. Si no existe, lo recrea con el mismo UID y email
 * 4. Genera una contraseña temporal; el usuario debe usar "Olvidé contraseña"
 */

import { createClient } from '@sanity/client';
import * as firebaseAdmin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Cargar .env.local si existe
function loadEnv() {
  const envPaths = ['.env.local', '.env'];
  for (const p of envPaths) {
    const full = resolve(process.cwd(), p);
    if (existsSync(full)) {
      const content = readFileSync(full, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eq = trimmed.indexOf('=');
          if (eq > 0) {
            const key = trimmed.slice(0, eq).trim();
            const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) process.env[key] = val;
          }
        }
      }
      console.log(`Variables cargadas desde ${p}`);
      return;
    }
  }
}

loadEnv();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const sanityToken = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !sanityToken) {
  console.error('Faltan variables: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN');
  process.exit(1);
}

const firebaseAdminConfig = {
  credential: firebaseAdmin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  }),
};

if (
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
  !process.env.FIREBASE_ADMIN_PRIVATE_KEY
) {
  console.error('Faltan variables de Firebase Admin');
  process.exit(1);
}

// Inicializar Firebase Admin
if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp(firebaseAdminConfig);
}
const adminAuth = firebaseAdmin.auth();

// Cliente Sanity con token
const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2023-05-03',
  useCdn: false,
  token: sanityToken,
});

function generateTempPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
  let p = '';
  for (let i = 0; i < 16; i++) {
    p += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return p;
}

async function main() {
  console.log('Obteniendo usuarios de Sanity con firebaseUid...\n');

  const sanityUsers = await sanityClient.fetch<Array<{
    _id: string;
    _type: string;
    firebaseUid?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }>>(
    `*[_type == "user" && defined(firebaseUid) && firebaseUid != "" && role != "member"]{
      _id,
      _type,
      firebaseUid,
      email,
      firstName,
      lastName,
      role
    }`
  );

  if (!sanityUsers?.length) {
    console.log('No se encontraron usuarios en Sanity con firebaseUid.');
    return;
  }

  console.log(`Encontrados ${sanityUsers.length} usuario(s) en Sanity con firebaseUid.\n`);

  let restored = 0;
  let skipped = 0;
  let errors = 0;

  for (const u of sanityUsers) {
    const uid = u.firebaseUid?.trim();
    const email = u.email?.trim();
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || uid;

    if (!uid || !email) {
      console.log(`⏭️  Omitido ${name} (${u._id}): sin uid o email`);
      skipped++;
      continue;
    }

    try {
      const firebaseUser = await adminAuth.getUser(uid);
      if (firebaseUser) {
        console.log(`✓ ${name}: ya existe en Firebase`);
        skipped++;
        continue;
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== 'auth/user-not-found') {
        console.error(`❌ Error al verificar ${name}:`, err);
        errors++;
        continue;
      }
    }

    try {
      const tempPassword = generateTempPassword();
      await adminAuth.createUser({
        uid,
        email,
        password: tempPassword,
        displayName: name || undefined,
        emailVerified: false,
      });
      console.log(`✅ Restaurado: ${name} (${email})`);
      console.log(`   → El usuario debe usar "Olvidé mi contraseña" para establecer una nueva.`);
      restored++;
    } catch (err: unknown) {
      console.error(`❌ Error al crear ${name}:`, err);
      errors++;
    }
  }

  console.log('\n--- Resumen ---');
  console.log(`Restaurados: ${restored}`);
  console.log(`Omitidos (ya existían o sin datos): ${skipped}`);
  console.log(`Errores: ${errors}`);
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
