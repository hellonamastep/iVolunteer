import React, { ReactNode } from 'react';

interface DetailSectionProps {
  title: string;
  icon?: ReactNode;
  iconBg?: string;
  children: ReactNode;
  className?: string;
}

export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  icon,
  iconBg = 'bg-gradient-to-br from-[#7DD9A6] to-[#6BC794]',
  children,
  className = '',
}) => {
  return (
    <div className={`border-2 border-[#D4E7B8] rounded-lg p-3 sm:p-4 md:p-5 ${className}`}>
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {typeof icon === 'string' ? (
            <span className="text-white text-sm sm:text-base md:text-lg">{icon}</span>
          ) : (
            icon
          )}
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-1">{title}</h3>
      </div>
      {children}
    </div>
  );
};

interface DetailInfoRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  isLast?: boolean;
}

export const DetailInfoRow: React.FC<DetailInfoRowProps> = ({
  icon,
  label,
  value,
  isLast = false,
}) => {
  return (
    <div className={`flex items-center justify-between gap-2 py-1.5 sm:py-2 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <span className="text-[10px] sm:text-xs text-gray-600 flex items-center flex-shrink-0">
        <span className="text-[#7DD9A6] mr-1 sm:mr-1.5 flex-shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      <span className="text-[10px] sm:text-xs font-medium text-gray-900 text-right">
        {value}
      </span>
    </div>
  );
};

interface DetailColumnHeaderProps {
  title: string;
  subtitle: string;
}

export const DetailColumnHeader: React.FC<DetailColumnHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h2>
      <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{subtitle}</p>
    </div>
  );
};

interface DetailDescriptionProps {
  text: string;
  className?: string;
}

export const DetailDescription: React.FC<DetailDescriptionProps> = ({
  text,
  className = '',
}) => {
  return (
    <p className={`text-gray-700 leading-relaxed text-xs sm:text-sm whitespace-pre-line ${className}`}>
      {text}
    </p>
  );
};
