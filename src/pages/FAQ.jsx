import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Gamepad2, Trophy, Wallet, Shield, Users } from 'lucide-react';

const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqCategories = [
    {
      title: "Getting Started",
      icon: Gamepad2,
      color: "blue",
      questions: [
        {
          question: "What is Max Battle?",
          answer: "Max Battle is a competitive gaming tournament platform where players can participate in various esports tournaments, win prizes, and compete with gamers worldwide."
        },
        {
          question: "How do I create an account?",
          answer: "Click on 'Register' and fill in your details including username, email, and game information. You'll receive an OTP for email verification."
        },
        {
          question: "Is Max Battle free to use?",
          answer: "Yes! Creating an account is free. Some tournaments are free while others require entry fees."
        },
        {
          question: "Which games are supported?",
          answer: "We currently support Free Fire Max with CLASH SQUAD and FULL MAP modes including 1v1, 2v2, and 4v4 tournaments."
        }
      ]
    },
    {
      title: "Tournaments",
      icon: Trophy,
      color: "yellow",
      questions: [
        {
          question: "How do I join a tournament?",
          answer: "Browse available tournaments on the home page, select one, and click 'Join Tournament'. Pay the entry fee if required and you'll be assigned a slot."
        },
        {
          question: "What are the tournament formats?",
          answer: "We offer CLASH SQUAD (1v1, 2v2, 4v4) and FULL MAP SOLO tournaments with different entry fees and prize pools."
        },
        {
          question: "When do tournaments start?",
          answer: "Each tournament has a specific start time displayed on the tournament details page. Make sure to join before the deadline."
        },
        {
          question: "How are winners determined?",
          answer: "Winners are determined by kills in CLASH SQUAD mode and overall performance in FULL MAP mode. Prize distribution follows the rules displayed for each tournament."
        }
      ]
    },
    {
      title: "Wallet & Payments",
      icon: Wallet,
      color: "green",
      questions: [
        {
          question: "How do I add money to my wallet?",
          answer: "Go to Wallet > Add Money, select amount, and complete payment through our secure Razorpay gateway."
        },
        {
          question: "What payment methods are accepted?",
          answer: "We accept Credit/Debit cards, UPI, Net Banking, and popular wallets like Paytm, Google Pay, and PhonePe."
        },
        {
          question: "How do I withdraw my winnings?",
          answer: "Setup UPI ID in your profile, then go to Wallet > Withdraw. Minimum withdrawal is ₹50 with 3% processing fee."
        },
        {
          question: "When will I receive my withdrawal?",
          answer: "Withdrawals are processed within 24 hours after verification. Amount will be credited to your linked UPI account."
        }
      ]
    },
    {
      title: "Refer & Earn",
      icon: Users,
      color: "purple",
      questions: [
        {
          question: "How does the referral program work?",
          answer: "Share your referral code with friends. When they sign up and play, both you and your friend get ₹5 bonus instantly."
        },
        {
          question: "Where can I find my referral code?",
          answer: "Go to Profile > Refer & Earn to see your unique referral code and track your referrals."
        },
        {
          question: "Is there a limit to how many people I can refer?",
          answer: "No limits! Refer as many friends as you want and keep earning bonuses."
        },
        {
          question: "How do I get my referral bonus?",
          answer: "Referral bonus is credited instantly to both referrer and referee's wallet once the referred person completes registration."
        }
      ]
    },
    {
      title: "Safety & Security",
      icon: Shield,
      color: "red",
      questions: [
        {
          question: "Is my data safe?",
          answer: "Yes! We use industry-standard encryption and secure payment gateways. Your personal information is never shared with third parties."
        },
        {
          question: "What happens if there's a tournament issue?",
          answer: "Our support team reviews all reported issues. Refunds are processed within 24-48 hours for valid technical problems."
        },
        {
          question: "Are tournaments fair?",
          answer: "We use automated systems and manual verification to ensure fair play. Any cheating attempts result in permanent bans."
        },
        {
          question: "How do I report a problem?",
          answer: "Contact our support team through the support button in the header or email us at maxbattlehelp@gmail.com."
        }
      ]
    }
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="text-center">
          <HelpCircle className="h-12 w-12 mx-auto mb-3" />
          <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-blue-100">Find answers to common questions about Max Battle</p>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <HelpCircle className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {faqCategories.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <div key={categoryIndex} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Category Header */}
                <div className={`p-4 bg-${category.color}-50 border-b border-${category.color}-200`}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-${category.color}-100 rounded-lg`}>
                      <Icon className={`h-6 w-6 text-${category.color}-600`} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{category.title}</h2>
                  </div>
                </div>

                {/* Questions */}
                <div className="divide-y divide-gray-100">
                  {category.questions.map((faq, faqIndex) => {
                    const isOpen = openItems.has(`${categoryIndex}-${faqIndex}`);
                    return (
                      <div key={faqIndex} className="border-gray-100">
                        <button
                          onClick={() => toggleItem(`${categoryIndex}-${faqIndex}`)}
                          className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-4">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 text-center">
          <HelpCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="flex flex-col space-y-3">
            <a
              href="https://wa.me/7898488935"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Contact Support</span>
            </a>
            <a
              href="mailto:maxbattlehelp@gmail.com"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Email Us</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <a
            href="/privacyPolicy"
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center"
          >
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="font-medium text-gray-900">Privacy Policy</div>
            <div className="text-sm text-gray-600">Data protection</div>
          </a>
          <a
            href="/termsAndCondition"
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center"
          >
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="font-medium text-gray-900">Terms & Conditions</div>
            <div className="text-sm text-gray-600">Platform rules</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;