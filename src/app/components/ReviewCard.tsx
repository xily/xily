import React from 'react';

type Review = {
  _id: string;
  userId: string;
  company: string;
  internshipId?: string;
  rating: number;
  pros: string;
  cons: string;
  advice?: string;
  createdAt: string | Date;
  userName?: string; // optional, if provided in future
};

function renderStars(rating: number) {
  const full = Math.round(rating);
  return (
    <span className="text-yellow-500" aria-label={`${full} out of 5`}>
      {'★★★★★'.slice(0, full)}
      <span className="text-gray-300">{'★★★★★'.slice(full)}</span>
    </span>
  );
}

export default function ReviewCard({ review }: { review: Review }) {
  const created = new Date(review.createdAt);
  const displayName = review.userName || 'Anonymous';

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-gray-900">{displayName}</div>
        <div>{renderStars(review.rating)}</div>
      </div>
      <div className="mt-2 text-xs text-gray-500">{created.toLocaleDateString()}</div>

      <div className="mt-4">
        <div className="text-sm font-medium text-gray-800">Pros</div>
        <p className="text-gray-700 whitespace-pre-line">{review.pros}</p>
      </div>

      <div className="mt-3">
        <div className="text-sm font-medium text-gray-800">Cons</div>
        <p className="text-gray-700 whitespace-pre-line">{review.cons}</p>
      </div>

      {review.advice && (
        <div className="mt-3">
          <div className="text-sm font-medium text-gray-800">Advice</div>
          <p className="text-gray-700 whitespace-pre-line">{review.advice}</p>
        </div>
      )}
    </div>
  );
}


