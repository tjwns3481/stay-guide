/**
 * ProfileSettings Component
 * 프로필 설정 섹션
 */

'use client';

interface ProfileSettingsProps {
  user: {
    name: string;
    email: string;
    imageUrl?: string;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">프로필</h2>

      <div className="flex items-start gap-6">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              이름
            </label>
            <p className="text-foreground">{user.name || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              이메일
            </label>
            <p className="text-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          프로필 정보는 Clerk 대시보드에서 관리됩니다.{' '}
          <a
            href="https://clerk.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Clerk 계정 관리 →
          </a>
        </p>
      </div>
    </div>
  );
}
