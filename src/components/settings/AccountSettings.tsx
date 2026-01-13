/**
 * AccountSettings Component
 * 계정 설정 섹션
 */

'use client';

import { useClerk } from '@clerk/nextjs';
import { useState } from 'react';

export function AccountSettings() {
  const { signOut } = useClerk();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/' });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">계정</h2>

      <div className="space-y-4">
        {/* Sign Out */}
        <div className="flex items-center justify-between py-3">
          <div>
            <h3 className="font-medium text-foreground">로그아웃</h3>
            <p className="text-sm text-muted-foreground">
              현재 기기에서 로그아웃합니다
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            로그아웃
          </button>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-destructive mb-3">
            위험 구역
          </h3>

          <div className="flex items-center justify-between py-3 px-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">계정 삭제</h4>
              <p className="text-sm text-muted-foreground">
                모든 데이터가 영구적으로 삭제됩니다
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-destructive border border-destructive/50 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              계정 삭제
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              정말 삭제하시겠습니까?
            </h3>
            <p className="text-muted-foreground mb-6">
              이 작업은 되돌릴 수 없습니다. 모든 가이드북과 데이터가 영구적으로
              삭제됩니다.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // TODO: Implement account deletion
                  alert('계정 삭제 기능은 아직 구현되지 않았습니다.');
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
