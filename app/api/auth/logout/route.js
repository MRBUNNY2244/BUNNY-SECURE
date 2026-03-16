import { NextResponse } from 'next/server';
import { clearAuthCookie, getAdminFromCookie } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ success: true });
  clearAuthCookie(res);
  return res;
}
