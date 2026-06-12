
'use client';
import { User } from 'lucide-react';

interface Props {
  avatar?: string | null;
  name: string;
  size?: number;
  color?: string;
}

export default function DoctorAvatar({ avatar, name, size = 52, color = 'var(--color-primary)' }: Props) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('');
  const hasPhoto = avatar && avatar !== '/images/default-doctor.png';

  return (
    <div style={{
      width: '100%', height: '100%', flexShrink: 0,
      overflow: 'hidden', border: `2px solid ${color}44`,
      background: `linear-gradient(135deg, ${color}22, ${color}55)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontWeight: 700, fontSize: size * 0.3,
    }}>
      {hasPhoto
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials || <User size={size * 0.45} />
      }
    </div>
  );
}