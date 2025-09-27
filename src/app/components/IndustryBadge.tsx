import { IndustryType } from '@/models/Internship';

interface IndustryBadgeProps {
  industry: IndustryType;
  className?: string;
}

const industryColors: Record<IndustryType, string> = {
  Tech: 'bg-purple-600-light text-purple-600 border-purple-600',
  Finance: 'bg-green-100 text-green-800 border-green-200',
  Marketing: 'bg-pink-100 text-pink-800 border-pink-200',
  Healthcare: 'bg-red-100 text-red-800 border-red-200',
  Consulting: 'bg-purple-100 text-purple-800 border-purple-200',
  Education: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Government: 'bg-gray-100 text-gray-800 border-gray-200',
  Other: 'bg-slate-100 text-slate-800 border-slate-200',
};

export default function IndustryBadge({ industry, className = '' }: IndustryBadgeProps) {
  const colorClasses = industryColors[industry] || industryColors.Other;
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses} ${className}`}
    >
      {industry}
    </span>
  );
}
