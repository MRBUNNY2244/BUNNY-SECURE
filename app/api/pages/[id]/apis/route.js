import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const db = getDb();
  const apis = db.prepare('SELECT * FROM page_apis WHERE page_id = ? ORDER BY sort_order ASC').all(params.id);
  return NextResponse.json({ success: true, apis });
}

export async function POST(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { api_name, api_url, api_key = '', method = 'POST', body_template = '{}', display_type = 'cards', sort_order = 0 } = await req.json();

    if (!api_name || !api_url)
      return NextResponse.json({ error: 'API name aur URL dalo.' }, { status: 400 });

    const db = getDb();
    const page = db.prepare('SELECT id FROM pages WHERE id = ?').get(params.id);
    if (!page) return NextResponse.json({ error: 'Page nahi mila.' }, { status: 404 });

    const result = db.prepare(
      'INSERT INTO page_apis (page_id, api_name, api_url, api_key, method, body_template, display_type, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(params.id, api_name, api_url, api_key, method, body_template, display_type, sort_order);

    return NextResponse.json({ success: true, api: db.prepare('SELECT * FROM page_apis WHERE id = ?').get(result.lastInsertRowid) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
