import React from "react";

const TermsOfUsePage: React.FC = () => {
  return (
    <div className="bg-transparent min-h-screen py-10 px-6 md:px-20 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
        <p className="text-sm mb-6">Last updated: March 31, 2025</p>

        <p className="mb-6">
          Welcome to <strong>Beyond the Bracket</strong>! By accessing or using our
          website, you agree to be bound by these Terms of Use. Please read them
          carefully.
        </p>

        <h2 className="text-xl font-semibold mb-2">1. Use of the Site</h2>
        <p className="mb-6">
          You agree to use this site only for lawful purposes and in a way that does
          not infringe the rights of, restrict, or inhibit anyone else's use and
          enjoyment of the website.
        </p>

        <h2 className="text-xl font-semibold mb-2">2. Intellectual Property</h2>
        <p className="mb-6">
          All content, including text, graphics, logos, and images, is the property of
          Beyond the Bracket or its licensors and is protected by applicable copyright
          laws.
        </p>

        <h2 className="text-xl font-semibold mb-2">3. NBA Team Logos and Imagery</h2>
        <p className="mb-6">
          All NBA team logos and related imagery used on this site are the property of
          the NBA and their respective teams. These logos are used solely for the
          purposes of recognition and fan engagement. We are not affiliated with or
          endorsed by the NBA or any of its teams.
        </p>

        <h2 className="text-xl font-semibold mb-2">4. User Accounts</h2>
        <p className="mb-6">
          If you create an account on our site, you are responsible for maintaining the
          confidentiality of your login credentials and all activities under your
          account.
        </p>

        <h2 className="text-xl font-semibold mb-2">5. Termination</h2>
        <p className="mb-6">
          We reserve the right to suspend or terminate your access to the site at our
          sole discretion, without notice, if we believe you have violated these Terms.
        </p>

        <h2 className="text-xl font-semibold mb-2">6. Changes to These Terms</h2>
        <p className="mb-6">
          We may revise these Terms from time to time. Any changes will be posted on
          this page with an updated date.
        </p>

        <h2 className="text-xl font-semibold mb-2">7. Contact Us</h2>
        <p className="mb-6">
          If you have any questions or concerns about these Terms of Use, you can
          contact us at:
        </p>
        <p className="font-medium">Email: support@beyond-the-bracket.com</p>

        <hr className="my-8" />

        <p className="text-xs text-gray-500">
          Copyright Disclaimer: All trademarks, logos, and brand names are the
          property of their respective owners. All company, product, and service
          names used on this website are for identification purposes only. Use of
          these names, trademarks, and brands does not imply endorsement.
        </p>
      </div>
    </div>
  );
};

export default TermsOfUsePage;
