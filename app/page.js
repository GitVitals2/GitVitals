'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * GitVitals - Home Page
 * Redirects to login page
 */

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return null;
}
