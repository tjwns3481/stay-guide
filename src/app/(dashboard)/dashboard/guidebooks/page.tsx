/**
 * Guidebooks List Page
 * 가이드북 목록 페이지
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { GuidebookList, EmptyState } from '@/components/dashboard';
import { getHostByEmail, getHostGuidebooks } from '@/lib/data/dashboard';

export default async function GuidebooksPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) {
    redirect('/sign-in');
  }

  const host = await getHostByEmail(email);
  const guidebooks = host ? await getHostGuidebooks(host.id) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">내 가이드북</h1>
          <p className="text-muted-foreground mt-1">
            가이드북을 만들고 관리하세요
          </p>
        </div>
        <Link
          href="/dashboard/guidebooks/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          새 가이드북
        </Link>
      </div>

      {/* Content */}
      {guidebooks.length > 0 ? (
        <GuidebookList guidebooks={guidebooks} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
