// "use client";
// import { useAdmin } from "@/contexts/admin-context";
// import React, { useState } from "react";
// import {
//   Clock,
//   CheckCircle,
//   XCircle,
//   ChevronDown,
//   ChevronUp,
//   Building2,
//   Users,
//   Calendar,
//   Search,
//   Filter,
//   AlertCircle,
// } from "lucide-react";

// const Approvalqueueadmin = () => {
//   const {
//     requests,
//     denialReason,
//     selectedId,
//     setDenialReason,
//     setSelectedId,
//     handleApprove,
//     handleDeny,
//   } = useAdmin();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterType, setFilterType] = useState("All");
//   const [expandedRequest, setExpandedRequest] = useState<number | null>(null);

//   const filteredRequests = requests.filter((request) => {
//     const matchesSearch = request.name
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase());
//     const matchesFilter = filterType === "All" || request.type === filterType;
//     return matchesSearch && matchesFilter;
//   });

//   const getTypeIcon = (type: string) => {
//     return type === "NGO" ? <Users size={16} /> : <Building2 size={16} />;
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 w-full flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
//       <div className="w-full max-w-8xl">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">
//             Approval Queue
//           </h1>
//           <p className="text-gray-600">
//             Review and manage pending registration requests
//           </p>
//         </div>

//         {/* Filters and Search */}
//         <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="relative flex-1">
//               <Search
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                 size={18}
//               />
//               <input
//                 type="text"
//                 placeholder="Search requests..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <select
//               value={filterType}
//               onChange={(e) => setFilterType(e.target.value)}
//               className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="All">All Types</option>
//               <option value="NGO">NGO</option>
//               <option value="Corporate">Corporate</option>
//             </select>
//           </div>
//         </div>

//         {/* Requests List */}
//         <div className="space-y-4">
//           {filteredRequests.length === 0 ? (
//             <div className="bg-white rounded-xl p-8 text-center shadow-sm">
//               <Clock className="mx-auto text-gray-400 mb-4" size={48} />
//               <h3 className="text-lg font-medium text-gray-800 mb-2">
//                 No pending requests
//               </h3>
//               <p className="text-gray-600">All requests have been processed</p>
//             </div>
//           ) : (
//             filteredRequests.map((item) => (
//               <div
//                 key={item.id}
//                 className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
//               >
//                 {/* Request Header */}
//                 <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                       {getTypeIcon(item.type)}
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-gray-800">
//                         {item.name}
//                       </h3>
//                       <div className="flex items-center gap-3 mt-1">
//                         <span
//                           className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
//                           ${
//                             item.type === "NGO"
//                               ? "bg-green-100 text-green-700"
//                               : "bg-purple-100 text-purple-700"
//                           }`}
//                         >
//                           {item.type}
//                         </span>
//                         <span className="flex items-center gap-1 text-sm text-gray-600">
//                           <Calendar size={14} />
//                           {item.submitted}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex gap-2 self-stretch sm:self-auto">
//                     <button
//                       onClick={() => handleApprove(item.id)}
//                       className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
//                     >
//                       <CheckCircle size={16} />
//                       Approve
//                     </button>
//                     <button
//                       onClick={() =>
//                         setSelectedId(selectedId === item.id ? null : item.id)
//                       }
//                       className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
//                     >
//                       <XCircle size={16} />
//                       Deny
//                     </button>
//                     <button
//                       onClick={() =>
//                         setExpandedRequest(
//                           expandedRequest === item.id ? null : item.id
//                         )
//                       }
//                       className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                     >
//                       {expandedRequest === item.id ? (
//                         <ChevronUp size={20} />
//                       ) : (
//                         <ChevronDown size={20} />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Expanded Details */}
//                 {expandedRequest === item.id && (
//                   <div className="px-6 pb-6 pt-2 border-t border-gray-100">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
//                       <div>
//                         <h4 className="font-medium text-gray-800 mb-2">
//                           Contact Information
//                         </h4>
//                         <p>Email: contact@example.com</p>
//                         <p>Phone: (555) 123-4567</p>
//                       </div>
//                       <div>
//                         <h4 className="font-medium text-gray-800 mb-2">
//                           Additional Details
//                         </h4>
//                         <p>
//                           Registration ID: REG-
//                           {item.id.toString().padStart(4, "0")}
//                         </p>
//                         <p>Status: Pending Review</p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Denial Reason Input */}
//                 {selectedId === item.id && (
//                   <div className="border-t border-gray-200 p-6 bg-red-50">
//                     <div className="flex items-start gap-3 mb-4">
//                       <AlertCircle className="text-red-600 mt-0.5" size={18} />
//                       <div>
//                         <h4 className="font-medium text-red-800 mb-1">
//                           Reason for Denial
//                         </h4>
//                         <p className="text-red-600 text-sm">
//                           Please provide a clear reason for denying this request
//                         </p>
//                       </div>
//                     </div>

//                     <textarea
//                       value={denialReason}
//                       onChange={(e) => setDenialReason(e.target.value)}
//                       placeholder="Explain why this request is being denied..."
//                       className="w-full rounded-lg border border-red-300 p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                       rows={3}
//                     />

//                     <div className="flex flex-wrap gap-3 mt-4">
//                       <button
//                         onClick={() => handleDeny(item.id)}
//                         disabled={!denialReason.trim()}
//                         className="flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                       >
//                         <XCircle size={16} />
//                         Confirm Denial
//                       </button>
//                       <button
//                         onClick={() => {
//                           setDenialReason("");
//                           setSelectedId(null);
//                         }}
//                         className="px-4 py-2 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>

//         {/* Stats Footer */}
//         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <Clock className="text-blue-600" size={20} />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Pending Requests</p>
//                 <p className="text-2xl font-bold text-gray-800">
//                   {requests.length}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-green-100 rounded-lg">
//                 <Users className="text-green-600" size={20} />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">NGO Requests</p>
//                 <p className="text-2xl font-bold text-gray-800">
//                   {requests.filter((r) => r.type === "NGO").length}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-purple-100 rounded-lg">
//                 <Building2 className="text-purple-600" size={20} />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Corporate Requests</p>
//                 <p className="text-2xl font-bold text-gray-800">
//                   {requests.filter((r) => r.type === "Corporate").length}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Approvalqueueadmin;
import React from 'react'

const Approvalqueueadmin = () => {
  return (
    <div>Approvalqueueadmin</div>
  )
}

export default Approvalqueueadmin