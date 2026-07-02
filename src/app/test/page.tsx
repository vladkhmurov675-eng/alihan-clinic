import ReviewCard from '../components/ReviewCard';


export default function TestPage(){
    return (
      <ReviewCard
        name="Имя Фамилия"
        date={new Date()}
        rating={3.5}
        reviewText="Это тестовый отзыв."
      />
    );
}