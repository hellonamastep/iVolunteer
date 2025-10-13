import Link from 'next/link';
import React from 'react';

const AddCorporateEventButton = () => {
  return (
    <div className="w-full flex justify-center">
        <Link href="/addcorporateevent">
      <button
        className="w-full sm:w-auto max-w-7xl bg-blue-600 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
      >
        + Add Corporate Event
      </button>
      </Link>
    </div>
  );
};

export default AddCorporateEventButton;
