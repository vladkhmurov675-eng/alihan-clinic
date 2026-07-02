import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';

interface Props {
    name: string;
    date: Date;
    reviewText: string;
    rating: number;
    avatar: string | StaticImport;
}

function StarRating({ rating, max = 5, id = 'stars' }: { rating: number; max?: number; id?: string }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => {
        const filled = Math.min(Math.max(rating - i, 0), 1);
        return <Star key={i} filled={filled} clipId={`${id}-${i}`} />;
      })}
    </div>
  );
}

function Star({ filled, clipId }: { filled: number; clipId: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={20 * filled} height="20" />
        </clipPath>
      </defs>
      <polygon
        points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
        fill="#e5e7eb"
      />
      <polygon
        points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
        fill="#f59e0b"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}



export default function ReviewCard({name, date, reviewText, rating, avatar}: Props) {
    return(
        <div className = 'review-card'>
            <Image className = 'avatar' src={avatar ?? 'public/avatar-default.svg'} alt = {name}
            width ={36} height = {36}/>
            <div className = 'name'>{name}</div>
            <div className = 'date'>{date.toLocaleDateString('ru-RU')}</div>
            <StarRating rating = {rating} id= {`review-${date.getTime()}`}/>
            <div className = 'review-text'>{reviewText}</div>
        </div>
    )
}