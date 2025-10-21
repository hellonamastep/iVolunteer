import React from "react";
import { FileText, Shield, Users, CreditCard, Lock, Mail, MapPin, Phone } from "lucide-react";

const TermsAndConditions = () => {
  const sections = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Acknowledgement & Acceptance",
      content: `By accessing or using our Platform, you acknowledge and accept these Terms of Use. We may modify these terms at any time without prior notice.`
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Registration & Accounts",
      content: `Users must register to access certain features. You are responsible for maintaining account confidentiality and all activities under your account.`
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Pricing & Payments",
      content: `All payments are processed through our secure payment gateway. Prices are subject to change without notice. Service charges are non-refundable.`
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Intellectual Property",
      content: `All content on the Platform is protected by intellectual property laws. Unauthorized use of trademarks or content is strictly prohibited.`
    }
  ];

  const quickLinks = [
    { title: "Registration Requirements", id: "registration" },
    { title: "Payment Terms", id: "payments" },
    { title: "User Content Policy", id: "content" },
    { title: "Cancellation & Refunds", id: "refunds" },
    { title: "Privacy & Data Security", id: "privacy" },
    { title: "Termination Policy", id: "termination" }
  ];

  return (
    <div className="min-h-screen bg-[#E8F8F7] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-2xl">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Welcome to Namastep. Please read these terms carefully before using our platform.
          </p>
          <div className="mt-6 text-sm text-gray-500 bg-white rounded-lg p-4 max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
                <ul className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={`#${link.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm transition-colors block py-2 border-b border-gray-100"
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Contact our support team for any questions about these terms.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>hello.namastep@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>+91 93239 51188</span>
                  </div>
                  {/* <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Flat No. 401, Building-7, Annapurna CHS, Hiranandani Gardens, Powai, Mumbai 400076</span>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Key Sections */}
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Terms Overview</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {sections.map((section, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          {section.icon}
                        </div>
                        <h3 className="font-semibold text-gray-900">{section.title}</h3>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Terms */}
              <div className="p-8">
                <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
                  
                  {/* Introduction */}
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                    <p className="leading-relaxed">
                      Welcome to Namastep. The domain is owned and operated by Vall Impact Ventures Private Limited 
                      ("Company"), a company incorporated under the provisions of the Companies Act, 2013. 
                      These Terms of Use govern your access and use of our Platform and Services.
                    </p>
                  </section>

                  {/* Registration */}
                  <section id="registration">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Registration Requirements</h3>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">For Service Providers:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Must be a law-abiding citizen of the country of origin</li>
                        <li>• Minors must have parental consent via email</li>
                        <li>• Must not have any prior criminal antecedents</li>
                        <li>• Must provide complete and accurate service details</li>
                      </ul>
                    </div>
                  </section>

                  {/* Payments */}
                  <section id="payments">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Terms</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 rounded-xl p-6">
                        <h4 className="font-semibold text-green-900 mb-3">Accepted Payment Methods</h4>
                        <ul className="space-y-2 text-green-800">
                          <li>• Credit & Debit Cards</li>
                          <li>• Net Banking</li>
                          <li>• Digital Wallets</li>
                          <li>• UPI Payments</li>
                        </ul>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-6">
                        <h4 className="font-semibold text-amber-900 mb-3">Service Charges</h4>
                        <p className="text-amber-800">
                          The Company charges a nominal 8% service fee above the service amount, 
                          which is solely used for donation purposes.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Refunds */}
                  <section id="refunds">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Cancellation & Refunds</h3>
                    <div className="bg-red-50 rounded-xl p-6">
                      <ul className="space-y-3 text-red-800">
                        <li>• No refunds for completed services</li>
                        <li>• Full refund if service provider cannot deliver</li>
                        <li>• Service charges are non-refundable</li>
                        <li>• Refunds processed to original payment method</li>
                      </ul>
                    </div>
                  </section>

                  {/* User Content */}
                  <section id="content">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">User Content Policy</h3>
                    <div className="bg-blue-50 rounded-xl p-6">
                      <p className="text-blue-800 mb-4">
                        Users are responsible for all content they upload, post, or transmit through our Platform.
                      </p>
                      <h4 className="font-semibold text-blue-900 mb-2">Prohibited Content:</h4>
                      <ul className="space-y-1 text-blue-800 text-sm">
                        <li>• Illegal, obscene, or harmful material</li>
                        <li>• Content infringing intellectual property rights</li>
                        <li>• Misleading or fraudulent information</li>
                        <li>• Viruses or malicious code</li>
                      </ul>
                    </div>
                  </section>

                  {/* Additional Important Sections */}
                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Important Notices</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900">Disclaimer of Warranty</h4>
                        <p className="text-gray-700 text-sm mt-1">
                          The Platform is provided "AS IS" without warranties of any kind. 
                          We do not guarantee uninterrupted or error-free service.
                        </p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-gray-900">Limitation of Liability</h4>
                        <p className="text-gray-700 text-sm mt-1">
                          The Company shall not be liable for any indirect, special, or consequential damages 
                          arising from the use of our Platform or Services.
                        </p>
                      </div>
                    </div>
                  </section>

                </div>
              </div>

              {/* Footer Notice */}
              <div className="bg-gray-900 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">
                      By using our Platform, you acknowledge that you have read, understood, 
                      and agree to be bound by these Terms & Conditions.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      Namastep  pvt.ltd
                    </p>
                    <p className="text-xs text-gray-400">
                      © {new Date().getFullYear()} All rights reserved
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;