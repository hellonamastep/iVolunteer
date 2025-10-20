import React from "react";
import Image from "next/image";
import { Shield, Users, FileText, Lock, Mail, Phone } from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "General Definitions",
      content: `All words and expressions used and not defined in this document but defined in the Act or the Rules shall have the meanings respectively assigned to them in the Act or the Rules. Reference to "you" or "your" in this Privacy Policy refers to any natural person who provide to the Company any Personal Information (PI) or Personal Data.`
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Who We Are?",
      content: `We own a platform and are in the business of engaging talented young adults to translate time and talent in works with non-profits to leverage different skills and raise funds for social impact organisations of their choice. The proceeds collected from the Users availing the services is then routed/directed from our bank account to the social impact organisation groups as selected by the service provider.`
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Personal Information We Collect",
      content: `We collect personal information that could identify you either by itself, or when combined with other information. When you register as a Service Provider or become our Users, we collect information that your browser sends to us including your computer's Internet Protocol ("IP") address, browser version, pages visited, time and date of visit, and other statistics.`
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Data Security",
      content: `We ensure to take all requisite and reasonable steps to protect your Personal Data. We use multi-layered protection system to safeguard the Personal Data of the users in all possible ways. We ensure to keep an eye on the use of the Personal Data by third parties and protect the Personal Data to the extent of our contracts with third parties.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-2xl">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Namastep is committed to protecting your privacy and ensuring the security of your personal information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Introduction */}
              <div className="p-8 border-b border-gray-100">
                <p className="text-gray-700 leading-relaxed">
                  Namastep (hereinafter referred to as "the Company") is a company undertaking the business of engaging young adults to translate time and talent in order to raise funds for social impact organisations incorporated in India.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  At the Company, respect for privacy is of fundamental value. For us, privacy is like a liability insurance to our users/service providers, their parents and guardians where the Company collects and processes certain personal data.
                </p>
              </div>

              {/* Key Sections */}
              <div className="divide-y divide-gray-100">
                {sections.map((section, index) => (
                  <div key={index} className="p-8 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-50 p-3 rounded-xl flex-shrink-0">
                        {section.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {section.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Information */}
              <div className="p-8 bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Rights & Contact Information
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    You have the right to access, rectify, or delete your personal data, limit or object to processing, withdraw consent, and receive your data for portability.
                  </p>
                  <div className="flex items-center space-x-4 text-gray-700">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span>hello.namastep@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-700">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span>+91 93239 51188</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {[
                  "Data Collection",
                  "Third Party Disclosure",
                  "Data Security",
                  "User Rights",
                  "Contact Information"
                ].map((item, index) => (
                  <li key={index}>
                    <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-blue-600 hover:text-blue-700 text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
              <p className="text-blue-100 text-sm mb-4">
                Contact our Data Protection Officer for any privacy-related concerns.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>hello.namastep@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 93239 51188</span>
                </div>
              </div>
            </div>

            {/* Update Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="text-amber-800 font-semibold mb-2">
                Policy Updates
              </h3>
              <p className="text-amber-700 text-sm">
                This Privacy Policy may be updated periodically. Please check back regularly for any changes.
              </p>
            </div>
          </div>
        </div>

        {/* Full Policy Section */}
        <div className="mt-16 bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Complete Privacy Policy
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              This Privacy Policy is applicable to your Personal Data which is accessed by us (through physical or electronic mode). Your use of the platform, or registrations with us through any modes or usage of any products including but not limited to any storage/transmitting device shall signify your acceptance of this Policy.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Information We Collect</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Personal identification information</li>
                  <li>• Contact information</li>
                  <li>• Payment and transaction details</li>
                  <li>• Technical and device information</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">How We Use Information</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• To provide and maintain services</li>
                  <li>• To process transactions</li>
                  <li>• To communicate with users</li>
                  <li>• To improve our platform</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mt-8">
              <h4 className="font-semibold text-gray-900 mb-3">Data Retention</h4>
              <p>
                We store personal data only for the time the user wants to conduct business on our platform and have completed all business dealings fairly. You may request us to remove your data earlier, subject to our internal policy and legal requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;   