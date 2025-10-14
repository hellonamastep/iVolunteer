import React from "react";
import Link from "next/link";
import { Settings, ArrowRight } from "lucide-react";

const Manageblogscta = () => {
  return (
    <div className=" flex items-center justify-center mb-5">
      <Link href="/manageblogs" className="group w-full max-w-7xl">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors duration-300">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Manage Blogs</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Create and organize your content
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Manageblogscta;
