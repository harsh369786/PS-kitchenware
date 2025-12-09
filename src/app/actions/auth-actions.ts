"use server";

import { cookies } from 'next/headers';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const ADMIN_USERNAME = "superman101";
const ADMIN_PASSWORD = "1Testmypolicy$";
const AUTH_COOKIE_NAME = 'ps-auth-token';

export async function login(credentials: unknown) {
  const parsedCredentials = loginSchema.safeParse(credentials);

  if (!parsedCredentials.success) {
    return { success: false, error: 'Invalid credentials format.' };
  }

  const { username, password } = parsedCredentials.data;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Set a secure, httpOnly cookie to manage the session
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, 'super-secret-auth-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    // Redirect to the dashboard after successful login
    redirect('/admin/dashboard');
  } else {
    return { success: false, error: 'Invalid username or password.' };
  }
}

export async function logout() {
  // Ensure the path is specified to correctly clear the cookie
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  });
}

export async function isAuthenticated() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get(AUTH_COOKIE_NAME);
    return !!authToken?.value;
}
