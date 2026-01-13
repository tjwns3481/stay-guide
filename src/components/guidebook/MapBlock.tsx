import { MapPin, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MapBlockProps {
  address: string;
  latitude: number;
  longitude: number;
  placeName?: string;
  placeId?: string;
}

export function MapBlock({ address, latitude, longitude, placeName }: MapBlockProps) {
  // 카카오맵 URL
  const kakaoMapUrl = `https://map.kakao.com/link/map/${placeName || '위치'},${latitude},${longitude}`;

  // 네이버맵 URL
  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(address)}`;

  // 정적 지도 이미지 URL (Kakao Static Map API 또는 placeholder)
  const staticMapUrl = `https://via.placeholder.com/400x200?text=Map`;

  return (
    <Card className="bg-[#FAF7F2]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-700" />
          <CardTitle>위치 안내</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 지도 미리보기 */}
        <div className="rounded-lg overflow-hidden h-40 bg-stone-200">
          <img src={staticMapUrl} alt="지도" className="w-full h-full object-cover" />
        </div>

        {/* 주소 */}
        <p className="text-stone-700">{address}</p>

        {/* 지도 앱 버튼 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-[#ffe812] hover:bg-[#fddc00] text-[#3c1e1e] border-0"
            onClick={() => window.open(kakaoMapUrl, '_blank')}
          >
            카카오맵
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-[#03c75a] hover:bg-[#02b351] text-white border-0"
            onClick={() => window.open(naverMapUrl, '_blank')}
          >
            네이버지도
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
