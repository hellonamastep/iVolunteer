import Link from 'next/link'
import React from 'react'

const Endeventarchivebutton = () => {
  return (
    <Link href="/endeventarchive">
      <button className="
        inline-flex 
        items-center 
        gap-2 
        px-6 
        py-3 
        bg-gradient-to-r 
        from-blue-600 
        to-indigo-700 
        hover:from-blue-700 
        hover:to-indigo-800 
        text-white 
        font-semibold 
        rounded-xl 
        shadow-md 
        hover:shadow-lg 
        transition-all 
        duration-200 
        transform 
        hover:-translate-y-0.5
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-2
        active:scale-95
      ">
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" 
          />
        </svg>
        View Archive
      </button>
    </Link>
  )
}

export default Endeventarchivebutton