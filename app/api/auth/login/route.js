import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDb from '@/lib/db';
import { signToken, setAuthCookie, checkRateLimit } from '@/lib/auth';

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  if (!checkRateLimit(ip, 5)) {
    return NextResponse.json({ error: '🔒 Bahut zyada galat login. 15 minute baad try karo.' }, { status: 429 });
  }

  try {
    const { username, password } = await req.json();
    if (!username || !password)
      return NextResponse.json({ error: 'Username aur password dono dalo.' }, { status: 400 });

    const db = getDb();
    const admin = db.prepare('SELECT * FROM admin WHERE id = 1').get();

    const usernameOk = admin.username.toLowerCase() === username.toLowerCase();
    const passOk = await bcrypt.compare(password, admin.password_hash);

    if (!usernameOk || !passOk) {
      db.prepare('INSERT INTO login_logs (ip, success) VALUES (?, 0)').run(ip);
      return NextResponse.json({ error: '❌ Username ya password galat hai.' }, { status: 401 });
    }

    db.prepare('INSERT INTO login_logs (ip, success) VALUES (?, 1)').run(ip);
    const token = await signToken({ id: 1, username: admin.username });

    const res = NextResponse.json({ success: true });
    setAuthCookie(res, token);
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
