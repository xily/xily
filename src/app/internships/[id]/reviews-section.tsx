'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import ReviewCard from '@/app/components/ReviewCard';
import LoadingSpinner from '@/app/components/LoadingSpinner';

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
  userName?: string;
};

export default function ReviewsSection({ internshipId, company }: { internshipId: string; company: string }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [advice, setAdvice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_BASE_URL || '', []);
  const alreadyReviewed = useMemo(() => {
    if (!session?.user?.id) return false;
    return reviews.some((r) => (r.internshipId === internshipId || String(r.internshipId) === String(internshipId)) && r.userId === session.user.id);
  }, [reviews, session?.user?.id, internshipId]);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime());
  }, [reviews]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place
  }, [reviews]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/reviews?internshipId=${encodeURIComponent(internshipId)}`, { cache: 'no-store' });
      const json = await res.json();
      if (json?.success) setReviews(json.data);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internshipId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!pros.trim()) {
      alert('Please provide pros for your review');
      return;
    }
    if (!cons.trim()) {
      alert('Please provide cons for your review');
      return;
    }
    if (rating < 1 || rating > 5) {
      alert('Please select a valid rating');
      return;
    }
    
    setLoading(true);
    try {
      const isEditing = Boolean(editingId);
      const url = isEditing
        ? `${baseUrl}/api/reviews?${editingId ? `id=${encodeURIComponent(editingId)}` : `internshipId=${encodeURIComponent(internshipId)}`}`
        : `${baseUrl}/api/reviews`;
      const method = isEditing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, internshipId, rating, pros, cons, advice }),
      });
      if (res.ok) {
        const created = await res.json();
        if (created?.data) {
          if (isEditing) {
            setReviews((prev) => prev.map((r) => (r._id === created.data._id ? created.data : r)));
          } else {
            setReviews((prev) => [created.data, ...prev]);
          }
          setRating(5);
          setPros('');
          setCons('');
          setAdvice('');
          setEditingId(null);
        } else {
          await fetchReviews();
        }
      }
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/reviews?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <section className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(Math.round(averageRating))}
              <span className="ml-1 text-sm font-medium text-gray-700">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      {loading && reviews.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" className="mr-2" />
          <span className="text-gray-500">Loading reviews…</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⭐</div>
          <p className="text-gray-500 text-lg">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="mb-6">
          {sortedReviews.map((review) => (
            <div key={review._id}>
              <ReviewCard review={review} />
              {session?.user?.id && review.userId === session.user.id && (
                <div className="-mt-2 mb-4 flex items-center gap-4">
                  <button onClick={() => {
                    setEditingId(review._id);
                    setRating(review.rating);
                    setPros(review.pros);
                    setCons(review.cons);
                    setAdvice(review.advice || '');
                  }} className="text-sm text-purple-600 hover:text-purple-700">Edit</button>
                  <button onClick={() => onDelete(review._id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {session?.user?.id && (!alreadyReviewed || editingId) ? (
        <form onSubmit={onSubmit} className="mt-6">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
              className="border rounded px-3 py-2 w-full mb-3"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pros</label>
            <textarea
              className="border rounded px-3 py-2 w-full mb-3"
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cons</label>
            <textarea
              className="border rounded px-3 py-2 w-full mb-3"
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Advice (optional)</label>
            <textarea
              className="border rounded px-3 py-2 w-full mb-3"
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Saving…' : editingId ? 'Save Changes' : 'Submit Review'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setRating(5); setPros(''); setCons(''); setAdvice(''); }}
              className="ml-3 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </form>
      ) : !session?.user?.id ? (
        <div className="text-gray-600 mt-4">Log in to write a review.</div>
      ) : (
        <div className="text-gray-600 mt-4">You have already submitted a review for this internship. You can edit your review above.</div>
      )}
    </section>
  );
}


