import React from 'react';
import { FileText, Users, Trophy, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const TermsAndCondition = () => {
  const sections = [
    {
      icon: Users,
      title: "User Eligibility",
      content: [
        "You must be at least 18 years old to use Max Battle",
        "You must provide accurate and complete registration information",
        "You are responsible for maintaining the confidentiality of your account",
        "One person may not maintain more than one account",
        "You must be a resident of India to participate in tournaments"
      ]
    },
    {
      icon: Trophy,
      title: "Tournament Rules",
      content: [
        "All participants must follow fair play guidelines",
        "Cheating, hacking, or any form of unfair advantage is strictly prohibited",
        "Tournament results are final and binding",
        "Max Battle reserves the right to disqualify participants for violations",
        "Entry fees are non-refundable except in cases of technical issues",
        "Winners must claim prizes within 30 days of tournament completion"
      ]
    },
    {
      icon: Shield,
      title: "Platform Usage",
      content: [
        "Users must not engage in abusive, harassing, or inappropriate behavior",
        "Sharing account credentials with others is prohibited",
        "Any attempt to manipulate the platform or games will result in permanent ban",
        "Users are responsible for their own internet connection and device",
        "Max Battle reserves the right to suspend or terminate accounts",
        "Platform maintenance may result in temporary service interruption"
      ]
    },
    {
      icon: CheckCircle,
      title: "Payment Terms",
      content: [
        "All transactions are processed through secure payment gateways",
        "Entry fees are deducted from user wallet balance",
        "Prize distributions occur within 24 hours of tournament completion",
        "Withdrawal requests are processed within 1-3 business days",
        "Minimum withdrawal amount is ₹50",
        "Processing fees apply to withdrawals as displayed",
        "All payments are in Indian Rupees (INR)"
      ]
    },
    {
      icon: AlertCircle,
      title: "Liability & Disclaimers",
      content: [
        "Max Battle is not responsible for internet connectivity issues",
        "Platform availability is not guaranteed 100% of the time",
        "Users participate in tournaments at their own risk",
        "Max Battle is not liable for any indirect or consequential damages",
        "We reserve the right to modify terms with reasonable notice",
        "Governing law is Indian law with jurisdiction in appropriate courts"
      ]
    }
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-3" />
          <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-green-100">Rules and guidelines for using Max Battle</p>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Last Updated */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">Last updated: December 2, 2025</p>
            <p className="text-xs mt-1">Effective from: December 2, 2025</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Welcome to Max Battle! These Terms and Conditions ("Terms") govern your use of our gaming tournament platform. By accessing or using Max Battle, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the service.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Max Battle is operated by our team and provides a platform for competitive gaming tournaments. These terms apply to all users, participants, and visitors of our platform.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-2">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span className="text-gray-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Prohibited Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 my-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
            Prohibited Activities
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            The following activities are strictly prohibited on Max Battle:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-gray-700">
              <li>• Using cheats, hacks, or third-party software</li>
              <li>• Impersonating other users or providing false information</li>
              <li>• Harassing, threatening, or abusing other users</li>
              <li>• Sharing explicit, offensive, or inappropriate content</li>
              <li>• Attempting to reverse engineer or hack the platform</li>
            </ul>
            <ul className="space-y-2 text-gray-700">
              <li>• Creating multiple accounts for unfair advantage</li>
              <li>• Manipulating tournament results or rankings</li>
              <li>• Selling or trading accounts</li>
              <li>• Distributing malware or viruses</li>
              <li>• Violating any applicable laws or regulations</li>
            </ul>
          </div>
        </div>

        {/* Account Termination */}
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 my-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Account Termination</h3>
              <p className="text-red-800 leading-relaxed">
                Max Battle reserves the right to suspend or terminate your account at any time for violations of these terms. Upon termination, you will lose access to your account, wallet balance, and any unclaimed prizes. We may also pursue legal action for serious violations.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Questions About Terms?</h3>
            <p className="text-gray-600 mb-4">
              If you have questions about these Terms and Conditions, please contact us:
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Email:</strong> legal@maxbattle.com</p>
              <p><strong>Support:</strong> maxbattlehelp@gmail.com</p>
              <p><strong>Phone:</strong> +91 7898488935</p>
            </div>
          </div>
        </div>

        {/* Acceptance */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            By using Max Battle, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndCondition;