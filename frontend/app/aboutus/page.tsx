import React from "react";
import Link from "next/link";

const aboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#4FC3DC] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Namastep</span>
            </Link>
            <Link 
              href="/"
              className="bg-[#4FC3DC] text-white px-6 py-2 rounded-full hover:bg-[#3aa8c0] transition duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            About <span className="text-[#4FC3DC]">Namastep</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Empowering communities through technology, innovation, and sustainable solutions for a better tomorrow.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="text-center md:text-left">
              <div className="w-16 h-16 bg-[#4FC3DC] rounded-full flex items-center justify-center mx-auto md:mx-0 mb-6">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                To create innovative solutions that address real-world challenges, foster sustainable development, 
                and empower individuals and communities to reach their full potential through accessible technology.
              </p>
            </div>

            {/* Vision */}
            <div className="text-center md:text-left">
              <div className="w-16 h-16 bg-[#4FC3DC] rounded-full flex items-center justify-center mx-auto md:mx-0 mb-6">
                <span className="text-white text-2xl">🔭</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                A world where technology serves as a bridge to opportunity, creating equitable access to resources, 
                education, and tools that enable every individual to contribute to and benefit from global progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "💡",
                title: "Innovation",
                description: "We constantly push boundaries to create cutting-edge solutions that make a real difference."
              },
              {
                icon: "🤝",
                title: "Collaboration",
                description: "We believe in the power of teamwork and partnerships to achieve greater impact together."
              },
              {
                icon: "🌱",
                title: "Sustainability",
                description: "Our solutions are designed for long-term positive impact on people and the planet."
              },
              {
                icon: "🔓",
                title: "Accessibility",
                description: "We make technology accessible to everyone, breaking down barriers to opportunity."
              },
              {
                icon: "❤️",
                title: "Integrity",
                description: "We operate with transparency, honesty, and strong ethical principles in everything we do."
              },
              {
                icon: "🚀",
                title: "Excellence",
                description: "We strive for the highest quality in our products, services, and customer experiences."
              }
            ].map((value, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition duration-300">
                <div className="w-14 h-14 bg-[#4FC3DC] rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">{value.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Our Story</h2>
          <p className="text-xl text-center text-gray-600 max-w-4xl mx-auto mb-12">
            Founded with a vision to make technology accessible and meaningful for everyone
          </p>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">From Idea to Impact</h3>
              <div className="space-y-4 text-gray-600">
                <p className="leading-relaxed">
                  Namastep began as a simple idea: to create technology that truly serves people. 
                  We noticed that while technology was advancing rapidly, many communities and individuals 
                  were being left behind.
                </p>
                <p className="leading-relaxed">
                  Our journey started with a small team of passionate developers, designers, and 
                  visionaries who believed that technology should be a force for good. We wanted to 
                  build solutions that not only solved problems but also created opportunities.
                </p>
                <p className="leading-relaxed">
                  Today, we're proud to have helped thousands of people access better opportunities, 
                  learn new skills, and connect with their communities in meaningful ways.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#4FC3DC] to-blue-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">What We've Achieved</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">100+</div>
                  <div className="text-blue-100">Users Empowered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">5+</div>
                  <div className="text-blue-100">Communities Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">2</div>
                  <div className="text-blue-100">Countries Reached</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">24/7</div>
                  <div className="text-blue-100">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Make a Difference Together?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join us in our mission to create a better, more connected world through technology and innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-[#4FC3DC] text-white px-8 py-4 rounded-full hover:bg-[#3aa8c0] transition duration-300 font-semibold text-lg"
            >
              Get In Touch
            </Link>
            <Link 
              href="/"
              className="border-2 border-[#4FC3DC] text-[#4FC3DC] px-8 py-4 rounded-full hover:bg-[#4FC3DC] hover:text-white transition duration-300 font-semibold text-lg"
            >
              Explore Our Work
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default aboutUs;