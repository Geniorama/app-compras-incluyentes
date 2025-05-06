import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/sanity.client'

export async function POST(request: Request) {
  const { email } = await request.json();
  const client = getAuthenticatedClient();

  // Buscar usuario publicado (no borrador)
  const user = await client.fetch(
    `*[_type == "user" && email == $email && !(_id in path("drafts.**"))][0]`,
    { email }
  );

  // Buscar usuario aunque sea borrador
  const userAny = await client.fetch(
    `*[_type == "user" && email == $email][0]`,
    { email }
  );

  if (!userAny) {
    return NextResponse.json({ exists: false, published: false });
  }
  if (!user) {
    return NextResponse.json({ exists: true, published: false });
  }
  return NextResponse.json({ exists: true, published: true });
} 