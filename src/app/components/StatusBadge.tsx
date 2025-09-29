'use client';

import React from 'react';

interface StatusBadgeProps {
  status: 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  size?: 'sm' | 'md' | 'lg';
}

const statusColors = {
  Saved: 'bg-gray-100 text-gray-800',
  Applied: 'bg-purpleBrand-light text-purpleBrand-accent',
  Interviewing: 'bg-yellow-100 text-yellow-800',
  Offer: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${statusColors[status]} ${sizeClasses[size]}`}>
      {status}
    </span>
  );
}
