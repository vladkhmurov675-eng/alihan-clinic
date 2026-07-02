'use client';

import { getAllReviews} from "../actions";
import { Review } from "../components/types";
import ReviewCard from "../components/ReviewCard";
import { useState, useEffect, useCallback } from "react";

export default function Reviews(){
    const [reviews, setReviews] = useState<Review[]>();
    
    
    useEffect(() => {
    async function loadReviews() {
        const allReviews = await getAllReviews();
        setReviews(allReviews);
    }

    loadReviews();
}, []);


    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {reviews?.map((r, i) => (
        <>  
            <div key = {i} style = {{margin: 'auto', marginBlock: '5px'}}>
            <ReviewCard
              key={i}
              name={r.name}
              date={r.date}
              rating={r.rating}
              avatar={r.avatar}
              reviewText={r.reviewText}
            />
            </div>
          </>
        ))}
      </div>
    );
}