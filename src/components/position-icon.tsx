import type { LucideProps } from 'lucide-react';
import { Target, Users, Shield, HandMetal } from 'lucide-react';
import type { Position } from '@/lib/types';
import { getPositionGroup } from '@/lib/utils';

export const PositionIcon = ({ position, ...props }: { position: Position } & LucideProps) => {
  const group = getPositionGroup(position);
  switch (group) {
    case 'Goalkeeper':
      return <HandMetal {...props} />;
    case 'Defender':
      return <Shield {...props} />;
    case 'Midfielder':
      return <Users {...props} />;
    case 'Forward':
      return <Target {...props} />;
    default:
      return null;
  }
};
