import React from "react";
import roiImg from "../assets/images/roi.jpg";
import royImg from "../assets/images/roy.jpg";

const AboutUsPage: React.FC = () => {
  return (
    <div className=" min-h-screen py-10 px-6 md:px-20 text-gray-800">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">About Us</h1>

        <p className="text-center text-lg mb-10">
          For 5 years, we ran our NBA Playoff prediction game with nothing but spreadsheets and group chats. In December 2024, we decided it was time for something better — and that’s how Beyond the Bracket was born.
          <br />
          Built by fans, for fans — this is the next evolution of our favorite tradition.
        </p>

        <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:justify-center">
          <div className="bg-white p-6 rounded-xl shadow text-center transform transition-transform duration-300 hover:scale-105 w-full max-w-sm">
            <img
              src={roiImg}
              alt="Roi Hass"
              className="w-28 h-28 mx-auto rounded-full mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold">Roi Hass</h3>
            <p className="text-sm text-gray-600">Full Stack Developer</p>
            <p className="mt-2 text-sm">
              Roi is the one who turned our ideas into reality. He built the platform from scratch — and still finds time to win bets. If it works smoothly, thank him. If it doesn’t... still thank him.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <a
                href="https://www.linkedin.com/in/roi-hass"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-700 transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="24"
                  height="24"
                  viewBox="0 0 50 50"
                  className="fill-current text-gray-600 hover:text-blue-600 transition-colors duration-300"
                >
                  <path d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z"></path>
                </svg>
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center transform transition-transform duration-300 hover:scale-105 w-full max-w-sm">
            <img
              src={royImg}
              alt="Roy Turiski"
              className="w-28 h-28 mx-auto rounded-full mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold">Roy Turiski</h3>
            <p className="text-sm text-gray-600">Product Lead & Game Designer</p>
            <p className="mt-2 text-sm">
              Roy is the creative force behind the rules, scoring, and structure. He’s the reason the game is balanced, fun, and a little competitive (okay, very competitive).
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <a
                href="https://www.linkedin.com/in/roy-turiski"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-700 transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="24"
                  height="24"
                  viewBox="0 0 50 50"
                  className="fill-current text-gray-600 hover:text-blue-600 transition-colors duration-300"
                >
                  <path d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <p className="text-center mt-12 text-gray-600">
          We’re just two NBA junkies who wanted to bring the hype of playoff predictions online. Whether you’re here to compete, have fun, or settle old rivalries — you’re in the right place.
        </p>

        <div className="mt-16 flex justify-center">
          <div className="bg-white p-6 rounded-xl shadow text-center transform transition-transform duration-300 hover:scale-105 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Special Thanks</h2>
            <p className="text-gray-700">
              Huge shoutout to <strong>Ido Alon</strong> — our DevOps wizard who helped us bring this project to life in the cloud. 
              From ECS to S3 to CloudFront, Ido made the magic happen behind the scenes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
