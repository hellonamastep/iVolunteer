"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useCorporateEvent } from "@/contexts/corporateEvent-context";
import { toast } from "react-hot-toast";
const categories = ["Technology", "Health", "Education", "Environment", "Sports", "Arts"];
const difficulties = ["Easy", "Medium", "Hard"];

interface FormValues {
  imageFile: FileList;
  category: string;
  organizedBy: string;
  date: string;
  time: string;
  duration: string;
  difficulty: string;
  referenceId: string;
  title: string;
  desc: string;
}

const AddCorporateEventForm: React.FC = () => {
  const { createEvent, loading, message, error } = useCorporateEvent();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      category: "",
      organizedBy: "",
      date: "",
      time: "",
      duration: "",
      difficulty: "Medium",
      referenceId: "",
      title: "",
      desc: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!data.imageFile || data.imageFile.length === 0) {
      toast.error("Please select an image file");
      return;
    }

    const formData = new FormData();
    formData.append("image", data.imageFile[0]);
    formData.append("category", data.category);
    formData.append("organizedBy", data.organizedBy);
    formData.append("date", data.date);
    formData.append("time", data.time);
    formData.append("duration", data.duration);
    formData.append("difficulty", data.difficulty);
    formData.append("referenceId", data.referenceId);
    formData.append("title", data.title);
    formData.append("desc", data.desc);

    try {
      const success = await createEvent(formData);
      
      if (success) {
        toast.success("Event created successfully! 🎉");
        reset();
      }
    } catch (err) {
      // Error is already handled in the context
      console.error("Form submission error:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl p-8 mt-8 border border-gray-100">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Add Corporate Event</h2>
        <p className="text-gray-600">Fill in the details below to create a new corporate event</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Upload */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Image <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              {...register("imageFile", { required: "Event image is required" })}
              className="w-full cursor-pointer"
            />
          </div>
          {errors.imageFile && (
            <p className="text-red-500 text-sm mt-1">{errors.imageFile.message}</p>
          )}
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select 
            {...register("category", { required: "Category is required" })} 
            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Organized By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organized By <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter organizer name"
            {...register("organizedBy", { required: "Organizer name is required" })}
            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
          {errors.organizedBy && (
            <p className="text-red-500 text-sm mt-1">{errors.organizedBy.message}</p>
          )}
        </div>

        {/* Event Title */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter event title"
            {...register("title", { required: "Event title is required" })}
            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Event Description */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Description <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Describe the event details..."
            rows={4}
            {...register("desc", { required: "Event description is required" })}
            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-vertical"
          />
          {errors.desc && (
            <p className="text-red-500 text-sm mt-1">{errors.desc.message}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("date", { required: "Event date is required" })}
            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            {...register("time", { required: "Event time is required" })}
            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
          {errors.time && (
            <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., 2 hours, 1 day"
            {...register("duration", { required: "Duration is required" })}
            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
          {errors.duration && (
            <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
          )}
        </div>

        {/* Difficulty Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level <span className="text-red-500">*</span>
          </label>
          <select 
            {...register("difficulty", { required: "Difficulty level is required" })} 
            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          >
            {difficulties.map((dif) => (
              <option key={dif} value={dif}>
                {dif}
              </option>
            ))}
          </select>
          {errors.difficulty && (
            <p className="text-red-500 text-sm mt-1">{errors.difficulty.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="col-span-1 md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                Creating Event...
              </div>
            ) : (
              "Add Event"
            )}
          </button>
        </div>
      </form>

      {/* Status Messages */}
      {message && !loading && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
          <p className="text-green-700 font-medium">{message}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default AddCorporateEventForm;