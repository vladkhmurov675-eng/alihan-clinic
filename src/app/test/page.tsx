'use client'; 
import ReviewForm from '../components/forms/ReviewForm';
import { ReviewFormData } from '../components/types';
import { useState } from 'react';


const reviewFormData: ReviewFormData = {
    name: '',
    reviewText: '',
    phone: '',
    avatar: '',
    rating: 0,
};

export default function TestPage(){
    const [formData, setFormData] = useState<ReviewFormData>(reviewFormData);
    return (
      <ReviewForm
      form = {formData}
      onChange = {(form: ReviewFormData) => {
        setFormData(form);
        console.log('Form changed:', form);
      }}
      onSubmit = {(e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form submitted');
      }}
      saving = {false}
      />
    );
}