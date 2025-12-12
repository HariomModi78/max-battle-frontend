import React from 'react';
import { Shield, Eye, Lock, Database, UserCheck, AlertTriangle } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "Personal information: name, email, phone number, gaming username",
        "Payment information: processed securely through Razorpay",
        "Gaming data: tournament participation, performance statistics",
        "Device information: IP address, browser type, device details",
        "Usage data: app interaction patterns, preferences"
      ]
    },
    {
      icon: Database,
      title: "How We Use Your Information",
      content: [
        "Provide gaming tournament services and user accounts",
        "Process payments and manage wallet transactions",
        "Send tournament updates and important notifications",
        "Improve our platform and user experience",
        "Prevent fraud and ensure fair play",
        "Comply with legal requirements"
      ]
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "All data is encrypted using industry-standard SSL/TLS protocols",
        "Payment information is processed through PCI-compliant gateways",
        "Regular security audits and vulnerability assessments",
        "Employee access is strictly controlled and monitored",
        "Data backups are encrypted and stored securely"
      ]
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: [
        "Access your personal data and request corrections",
        "Request deletion of your account and associated data",
        "Opt-out of marketing communications",
        "Data portability - request your data in machine-readable format",
        "Withdraw consent for data processing where applicable"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Data Sharing",
      content: [
        "We do NOT sell your personal information to third parties",
        "Limited sharing with payment processors for transaction processing",
        "Tournament results may be displayed publicly (without personal contact info)",
        "Legal compliance may require sharing data with authorities",
        "Service providers (hosting, analytics) under strict confidentiality agreements"
      ]
    }
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-3" />
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-blue-100">How we protect your data and privacy</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Max Battle ("we", "our", or "us") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our gaming tournament platform.
          </p>
          <p className="text-gray-700 leading-relaxed">
            By using Max Battle, you agree to the collection and use of information in accordance with this policy. We will not use or share your information except as described in this Privacy Policy.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold mt-1">•</span>
                        <span className="text-gray-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 my-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cookies and Tracking</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use cookies and similar tracking technologies to enhance your experience on our platform. These help us:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• Remember your login status and preferences</li>
            <li>• Analyze platform usage and improve performance</li>
            <li>• Provide personalized content and recommendations</li>
            <li>• Ensure platform security and prevent fraud</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            You can control cookie settings through your browser preferences, though disabling cookies may affect platform functionality.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 my-6">
          <div className="text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Questions About Privacy?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Email:</strong> privacy@maxbattle.com</p>
              <p><strong>Support:</strong> maxbattlehelp@gmail.com</p>
              <p><strong>Phone:</strong> +91 7898488935</p>
            </div>
          </div>
        </div>

        {/* Changes to Policy */}
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Changes to This Policy</h3>
              <p className="text-yellow-800 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;