import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function GET() {
  const client = getAuthenticatedClient();
  const users = await client.fetch(`*[_type == "user" && !(_id in path('drafts.**'))]{
    _id,
    firstName,
    lastName,
    email,
    role
  }`);
  return NextResponse.json({ users });
} 