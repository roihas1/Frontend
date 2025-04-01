import React from "react";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-10 px-6 md:px-20 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm mb-6">Last updated: March 31, 2025</p>

        <p className="mb-6">
          Welcome to <strong>Beyond the Bracket</strong> ("we," "our," or "us").
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and safeguard your information when you use our website
          and services.
        </p>

        <hr className="my-6" />

        <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
        <p className="mb-2 font-medium">a. Information You Provide:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>
            When you sign up or log in via Google OAuth, we collect your name,
            email address, and profile picture.
          </li>
          <li>
            When you create or manage your account, we may also collect
            information you provide such as username and preferences.
          </li>
        </ul>

        <p className="mb-2 font-medium">b. No Automatic Data Collection:</p>
        <ul className="list-disc ml-6 mb-6">
          <li>
            We do not collect IP addresses, browser types, device information,
            pages visited, or time spent on our site.
          </li>
          <li>We do not use cookies or similar tracking technologies.</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc ml-6 mb-6">
          <li>Provide and maintain the website and services</li>
          <li>Authenticate users via Google OAuth</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">3. Sharing Your Information</h2>
        <p className="mb-6">
          We do <strong>not</strong> sell, rent, or share your personal
          information with third parties.
        </p>

        <h2 className="text-xl font-semibold mb-2">4. Your Choices</h2>
        <ul className="list-disc ml-6 mb-6">
          <li>You may disconnect your Google account at any time.</li>
          <li>
            You may request to delete your account and associated data by
            contacting us.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
        <p className="mb-6">
          We implement appropriate measures to protect your data, including
          secure transmission (HTTPS) and access controls.
        </p>

        <h2 className="text-xl font-semibold mb-2">6. Children’s Privacy</h2>
        <p className="mb-6">
          Our service is not intended for users under 13. We do not knowingly
          collect information from children.
        </p>

        <h2 className="text-xl font-semibold mb-2">7. Changes to This Policy</h2>
        <p className="mb-6">
          We may update this policy. We’ll notify you of significant changes by
          posting an updated version on this page.
        </p>

        <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
        <p className="mb-6">
          If you have any questions or concerns about this Privacy Policy, please
          contact us at:
        </p>
        <p className="font-medium">Email: support@beyond-the-bracket.com</p>

        <p className="mt-8">Thank you for trusting Beyond the Bracket!</p>

        <hr className="my-8" />

        <p className="text-xs text-gray-500">
          Disclaimer: All NBA team logos and related imagery are used solely for
          the purpose of recognition and fan engagement. We are not affiliated
          with or endorsed by the NBA or any of its teams.
        </p>

        <p className="text-xs text-gray-500 mt-2">
          Copyright Disclaimer: All trademarks, logos, and brand names are the
          property of their respective owners. All company, product, and service
          names used in this website are for identification purposes only. Use of
          these names, trademarks, and brands does not imply endorsement.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
