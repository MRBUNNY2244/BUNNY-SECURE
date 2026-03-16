import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDb from '@/lib/db';

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    if (!token || !password || password.length < 6)
      return NextResponse.json({ error: 'Token aur naya password (min 6 chars) dalo.' }, { status: 400 });

    const db = getDb();
    const admin = db.prepare('SELECT * FROM admin WHERE id = 1').get();

    if (admin.reset_token !== token || Date.now() > admin.reset_expires)
      return NextResponse.json({ error: 'Link expire ho gayi ya galat hai.' }, { status: 400 });

    const hash = await bcrypt.hash(password, 12);
    db.prepare('UPDATE admin SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = 1').run(hash);

    return NextResponse.json({ success: true, message: '✅ Password change ho gaya! Ab login karo.' });
  } catch (e) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
