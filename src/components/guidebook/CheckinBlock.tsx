import { Clock, LogIn, LogOut } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CheckinBlockProps {
  checkinTime: string;  // "15:00"
  checkoutTime: string; // "11:00"
  instructions?: string;
}

export function CheckinBlock({ checkinTime, checkoutTime, instructions }: CheckinBlockProps) {
  return (
    <Card className="bg-[#FAF7F2]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-700" />
          <CardTitle>체크인/아웃</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white">
            <div className="flex items-center gap-2 text-stone-500 text-sm mb-2">
              <LogIn className="w-4 h-4" />
              체크인
            </div>
            <p className="text-2xl font-bold">{checkinTime}</p>
          </div>
          <div className="p-4 rounded-xl bg-white">
            <div className="flex items-center gap-2 text-stone-500 text-sm mb-2">
              <LogOut className="w-4 h-4" />
              체크아웃
            </div>
            <p className="text-2xl font-bold">{checkoutTime}</p>
          </div>
        </div>
        {instructions && (
          <p className="mt-4 text-sm text-stone-600">{instructions}</p>
        )}
      </CardContent>
    </Card>
  );
}
