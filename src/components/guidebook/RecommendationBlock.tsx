import { Utensils, Coffee, Landmark } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface RecommendationItem {
  name: string;
  description?: string;
  distance?: string;
  link?: string;
}

interface RecommendationBlockProps {
  title?: string;
  category: 'restaurant' | 'cafe' | 'attraction' | 'etc';
  items: RecommendationItem[];
}

const categoryIcons = {
  restaurant: Utensils,
  cafe: Coffee,
  attraction: Landmark,
  etc: Landmark,
};

const categoryLabels = {
  restaurant: '맛집',
  cafe: '카페',
  attraction: '관광지',
  etc: '추천',
};

export function RecommendationBlock({ title, category, items }: RecommendationBlockProps) {
  const Icon = categoryIcons[category];
  const label = categoryLabels[category];

  return (
    <Card className="bg-[#FAF7F2]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-amber-700" />
          <CardTitle>{title || `주변 ${label}`}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="p-3 rounded-lg bg-white">
              <p className="font-medium">{item.name}</p>
              {item.description && (
                <p className="text-sm text-stone-500 mt-1">{item.description}</p>
              )}
              {item.distance && (
                <p className="text-xs text-stone-400 mt-1">{item.distance}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
