import React from 'react'
import Link from 'next/link'
import { Calendar, ArrowRight, Building2 } from 'lucide-react'

const Managecopeventcta = () => {
  return (
    <div className="max-w-7xl mx-auto mb-8 ">
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl  overflow-hidden">
        <div className="px-6 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Content */}
            <div className="flex items-center gap-4 md:gap-6">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Manage Corporate Events
                </h3>
                <p className="text-emerald-100 text-sm md:text-base">
                  Professional event management platform
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <Link 
              href="/managecopertaeevent"
              className="group bg-white text-emerald-700 px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 min-w-[160px] justify-center"
            >
              <Calendar className="h-5 w-5" />
              <span>View Events</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Managecopeventcta