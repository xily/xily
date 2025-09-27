interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function ChartContainer({ children, className = '' }: ChartContainerProps) {
  return (
    <div className={`w-full h-64 ${className}`}>
      {children}
    </div>
  );
}
