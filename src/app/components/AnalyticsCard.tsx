interface AnalyticsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function AnalyticsCard({ title, children, className = '' }: AnalyticsCardProps) {
  return (
    <div className={`border rounded-lg p-4 mb-6 shadow-sm bg-white ${className}`}>
      <h3 className="text-lg font-bold mb-2 text-gray-900">{title}</h3>
      {children}
    </div>
  );
}
