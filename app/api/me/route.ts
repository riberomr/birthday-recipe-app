import { NextResponse } from 'next/server';
import { getUserFromRequest, getProfileFromFirebase } from '@/lib/auth/requireAuth';

export async function GET(request: Request) {
  try {
    const decodedToken = await getUserFromRequest(request);

    if (!decodedToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await getProfileFromFirebase(
      decodedToken.uid,
      decodedToken.email,
      decodedToken.name,
      decodedToken.picture
    );

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in /api/me:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
