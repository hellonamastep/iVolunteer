import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationConfirmationDialogProps {
  isOpen: boolean;
  userCity?: string;
  eventLocation: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LocationConfirmationDialog: React.FC<LocationConfirmationDialogProps> = ({
  isOpen,
  userCity,
  eventLocation,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Different Location</h3>
            <p className="text-sm text-gray-600">Cross-city event participation</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            You are from <span className="font-semibold text-teal-600">{userCity || 'your city'}</span>, but this event is in{' '}
            <span className="font-semibold text-amber-600">{eventLocation}</span>.
          </p>
          <p className="text-gray-600 text-sm">
            Would you still like to send a participation request for this event?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Yes, Apply
          </button>
        </div>
      </div>
    </div>
  );
};
