import COLORS from '../../constants/colors.constant';

export const PIE_COLORS = [
  COLORS.black300,    // New
  COLORS.green500,     // Learning
  COLORS.yellow500,    // Reviewing
];

export const StatItem: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col items-center p-3 border rounded-lg">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);
