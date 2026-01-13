import { Wifi, Copy, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface WifiBlockProps {
  ssid: string;
  password: string;
  instructions?: string;
}

export function WifiBlock({ ssid, password, instructions }: WifiBlockProps) {
  const { copied, copyToClipboard } = useCopyToClipboard();

  return (
    <Card className="bg-[#FAF7F2]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-amber-700" />
          <CardTitle>와이파이</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-stone-500">이름</span>
            <span className="font-medium">{ssid}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">비밀번호</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium">{password}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(password)}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
        {instructions && (
          <p className="mt-4 text-sm text-stone-600">{instructions}</p>
        )}
      </CardContent>
    </Card>
  );
}
