import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function DELETE(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const db = getDb();
  db.prepare('DELETE FROM page_apis WHERE id = ? AND page_id = ?').run(params.apiId, params.id);
  return NextResponse.json({ success: true, message: 'API delete ho gayi.' });
}
