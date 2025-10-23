"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Heart, Users, HandHeart, Send } from "lucide-react";
import { Header } from "@/components/header";
import Footer from "@/components/Footer";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactUs() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  return (
    <div
      className="w-full min-h-screen bg-[#f0f9f8] overflow-hidden"
      style={{ fontFamily: "Satoshi, sans-serif" }}
    >
      {/* Header */}
      {/* <Header /> */}
      {/* Hero Section */}
      <section className="relative w-full h-[425px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-[center_25%]"
          style={{ backgroundImage: "url(/ContactUs_Hero.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#59b4c35c] via-[#59b4c35c] to-[#eff3965c]" />

        <div className="relative z-10 flex flex-col items-center gap-6 px-5">
          <h1 className="text-white text-center font-bold text-4xl sm:text-5xl lg:text-6xl lg:leading-[60px] max-w-[749px]">
            Make a Difference Today
          </h1>
          <p className="text-white/95 text-center text-lg sm:text-xl lg:text-2xl font-medium leading-7 max-w-[591px]">
            Join our community of volunteers and help create positive change
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-5">
        <div className="max-w-7xl mx-auto">
          {/* Cards Grid - Stacked on mobile, grid on larger screens */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-6 sm:gap-8 lg:gap-10">
            {/* Compassion Card */}
            <article className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 sm:p-8 w-full sm:w-[calc(50%-1rem)] lg:w-[363px] flex flex-col items-center gap-3 sm:gap-4 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#59b4c3] to-[#eff396] flex items-center justify-center">
                <Heart
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="white"
                />
              </div>
              <h3 className="text-black text-lg sm:text-xl font-bold leading-tight">
                Compassion
              </h3>
              <p className="text-[#65758b] text-sm sm:text-base font-medium leading-relaxed">
                We lead with empathy and care for every person we serve
              </p>
            </article>

            {/* Community Card */}
            <article className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 sm:p-8 w-full sm:w-[calc(50%-1rem)] lg:w-[363px] flex flex-col items-center gap-3 sm:gap-4 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-[#f06b42] to-[#f69855] flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-black text-lg sm:text-xl font-bold leading-tight">
                Community
              </h3>
              <p className="text-[#65758b] text-sm sm:text-base font-medium leading-relaxed">
                Together we create stronger, more connected neighborhoods
              </p>
            </article>

            {/* Impact Card */}
            <article className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 sm:p-8 w-full sm:w-[calc(50%-1rem)] lg:w-[363px] flex flex-col items-center gap-3 sm:gap-4 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#74e291] to-[#eff396] flex items-center justify-center">
                <HandHeart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-black text-lg sm:text-xl font-bold leading-tight">
                Impact
              </h3>
              <p className="text-[#65758b] text-sm sm:text-base font-medium leading-relaxed">
                Every action, no matter how small, creates meaningful change
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-24 px-5">
        {/* Decorative Mascots - Responsive sizing */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-12 sm:bottom-24 left-[2%] sm:left-[5%] w-[120px] h-[100px] sm:w-[200px] sm:h-[180px] lg:w-[281px] lg:h-[230px]">
            <img
              src="/mascots/mascot_standing.png"
              alt="Standing mascot"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute top-1/2 right-[2%] sm:right-[5%] lg:right-[8%] w-[100px] h-[120px] sm:w-[150px] sm:h-[180px] lg:w-[218px] lg:h-[249px] rotate-[13.818deg]">
            <img
              src="/mascots/mascot_star.png"
              alt="Star mascot"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute top-[5%] left-[2%] sm:left-[5%] lg:left-[10%] w-[130px] h-[150px] sm:w-[200px] sm:h-[240px] lg:w-[300px] lg:h-[350px]">
            <img
              src="/mascots/mascot_on_cloud.png"
              alt="Cloud mascot"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-black text-center text-3xl sm:text-4xl font-bold leading-10 mb-6">
            Get In Touch
          </h2>
          <p className="text-[#65758b] text-center text-lg sm:text-xl font-medium leading-7 max-w-[654px] mb-12">
            Have questions or want to learn more about volunteering
            opportunities? We'd love to hear from you!
          </p>

          {/* Contact Form */}
          <div className="w-full max-w-[672px] bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-black text-sm font-normal"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  className="w-full h-10 px-4 bg-white border border-[#e1e7ef] rounded-lg text-sm text-[#999] placeholder:text-[#999] focus:border-[#28bdbd] focus:outline-none focus:ring-2 focus:ring-[#28bdbd]/20"
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-black text-sm font-normal"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                  className="w-full h-10 px-4 bg-white border border-[#e1e7ef] rounded-lg text-sm text-[#999] placeholder:text-[#999] focus:border-[#28bdbd] focus:outline-none focus:ring-2 focus:ring-[#28bdbd]/20"
                />
              </div>

              {/* Phone Field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="phone"
                  className="text-black text-sm font-normal"
                >
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-10 px-4 bg-white border border-[#e1e7ef] rounded-lg text-sm text-[#999] placeholder:text-[#999] focus:border-[#28bdbd] focus:outline-none focus:ring-2 focus:ring-[#28bdbd]/20"
                />
              </div>

              {/* Message Field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="message"
                  className="text-black text-sm font-normal"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="w-full min-h-[138px] px-4 py-3 bg-white border border-[#e1e7ef] rounded-lg text-sm resize-none focus:border-[#28bdbd] focus:outline-none focus:ring-2 focus:ring-[#28bdbd]/20"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-10 bg-[#28bdbd] hover:bg-[#239e9e] rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <span className="text-white text-sm font-normal leading-5">
                  Send Message
                </span>
                <Send className="w-5 h-5 text-white" />
              </button>
            </form>
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
}
