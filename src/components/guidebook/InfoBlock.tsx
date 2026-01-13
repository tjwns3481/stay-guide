/**
 * InfoBlock Component
 * 동적 블록 렌더러 - 타입에 따라 적절한 컴포넌트 렌더링
 */

import type { Block } from '@/db/schema';
import { WifiBlock } from './WifiBlock';
import { MapBlock } from './MapBlock';
import { CheckinBlock } from './CheckinBlock';
import { RecommendationBlock } from './RecommendationBlock';
import { CustomBlock } from './CustomBlock';

interface InfoBlockProps {
  block: Block;
}

export function InfoBlock({ block }: InfoBlockProps) {
  // 숨겨진 블록은 렌더링하지 않음
  if (!block.isVisible) {
    return null;
  }

  const content = block.content as Record<string, unknown>;

  const renderBlock = () => {
    switch (block.type) {
      case 'wifi':
        return (
          <WifiBlock
            ssid={content.ssid as string}
            password={content.password as string}
            instructions={content.instructions as string | undefined}
          />
        );

      case 'map':
        return (
          <MapBlock
            address={content.address as string}
            latitude={content.latitude as number}
            longitude={content.longitude as number}
            placeName={content.placeName as string | undefined}
            instructions={content.instructions as string | undefined}
          />
        );

      case 'checkin':
        return (
          <CheckinBlock
            checkinTime={content.checkinTime as string}
            checkoutTime={content.checkoutTime as string}
            instructions={content.instructions as string | undefined}
          />
        );

      case 'recommendation':
        return (
          <RecommendationBlock
            category={content.category as string}
            items={content.items as Array<{
              name: string;
              description?: string;
              address?: string;
              distance?: string;
              imageUrl?: string;
            }>}
          />
        );

      case 'custom':
        return (
          <CustomBlock
            title={block.title}
            text={content.text as string}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div data-testid="info-block" data-block-type={block.type}>
      {renderBlock()}
    </div>
  );
}
