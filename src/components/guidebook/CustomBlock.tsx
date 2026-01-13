/**
 * CustomBlock Component
 * 커스텀 정보 블록 - 자유 형식 텍스트
 */

import { FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CustomBlockProps {
  title: string;
  text: string;
}

export function CustomBlock({ title, text }: CustomBlockProps) {
  return (
    <Card className="bg-[#FAF7F2]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-700" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-stone-600 whitespace-pre-wrap">{text}</p>
      </CardContent>
    </Card>
  );
}
