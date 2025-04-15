import { Link } from "react-router-dom";
import { useRef } from "react";
import Logo from "../assets/siteLogo/gray_trans.png";
import Demo from "../assets/video/Demo.mp4";
import cover from "../assets/images/cover.png";

const WelcomePage = () => {
  const howItWorksRef = useRef<HTMLDivElement | null>(null);

  const scrollToSteps = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-gray-100 flex flex-col items-center overflow-x-hidden">
      {/* Hero Section */}
      <section className="w-full flex flex-col justify-center items-center min-h-[90vh] px-4 py-10 sm:py-20 text-center relative">
        {/* Background Logo */}
        <div className="absolute inset-0 flex justify-center items-center z-0 opacity-10 pointer-events-none">
          <img src={Logo} alt="logo" className="w-48 sm:w-72 md:w-1/3" />
        </div>

        {/* Hero Content */}
        <div className="z-10 max-w-5xl w-full space-y-4">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight">
            Welcome to{" "}
            <span className="text-colors-nba-blue">Beyond the Bracket</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-700 px-2">
            Predict NBA playoff outcomes, compete with friends, and dominate the
            leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 w-full">
            <Link to="/signup" className="w-full sm:w-auto">
              <button className="bg-gradient-to-r from-yellow-400 to-red-500 text-white py-3 px-6 rounded-full font-semibold transition-all duration-300 hover:-translate-y-1 min-w-[140px] text-sm sm:text-base w-full">
                Sign Up & Play
              </button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <button className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 px-6 rounded-full font-semibold transition-all duration-300 hover:-translate-y-1 min-w-[140px] text-sm sm:text-base w-full">
                Login
              </button>
            </Link>
          </div>

          <p className="text-xs text-gray-500 pt-2 px-2">
            Think you know basketball? Let’s find out.
          </p>
          <p className="text-xs text-gray-500 mt-4 text-center">
            *This app is for entertainment purposes only. No real money is
            involved.
          </p>
        </div>

        {/* Scroll Down Arrow */}
        <button
          onClick={scrollToSteps}
          className="absolute bottom-8 animate-bounce z-10 text-gray-600 hover:text-colors-nba-blue transition-colors duration-300"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </section>

      {/* How It Works Section */}
      <section
        ref={howItWorksRef}
        className="w-full max-w-6xl px-4 sm:px-6 md:px-10 pb-20 scroll-mt-24"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 text-gray-800">
          How It <span className="text-colors-nba-blue">Works</span>
        </h2>

        {/* Mobile Carousel */}
        <div className="sm:hidden w-full overflow-x-auto pb-4 px-2">
          <div className="flex gap-4 w-max px-1 snap-x snap-mandatory scroll-smooth">
            {[
              {
                step: "01",
                title: "Join the Madness",
                description:
                  "Sign up or log in to enter the playoff action. It’s fast, free, and takes just a minute.",
              },
              {
                step: "02",
                title: "Make Your Predictions",
                description:
                  "Choose which teams you think will win each series. Predict match outcomes, game counts, and player stats.",
              },
              {
                step: "03",
                title: "Compete with Friends",
                description:
                  "Create or join leagues and go head-to-head with your friends to see who really knows basketball.",
              },
            ].map(({ step, title, description }) => (
              <div
                key={step}
                className={` ${
                  step === "02"
                    ? "bg-gradient-to-br from-colors-nba-blue to-blue-600"
                    : "bg-white"
                } relative snap-start shrink-0 w-[85vw]  rounded-xl shadow-lg p-6  mb-12 hover:-translate-y-1 transition-all duration-300 overflow-visible`}
              >
                <div className="absolute top-1 left-0 bg-colors-nba-yellow text-white font-bold w-8 h-8 flex items-center justify-center rounded-full shadow-md z-10">
                  {step}
                </div>
                <h3
                  className={` ${
                    step === "02" ? "text-white" : "text-gray-800"
                  } text-xl font-bold mb-2 mt-4`}
                >
                  {title}
                </h3>
                <p
                  className={`${
                    step === "02" ? "text-white" : "text-gray-600"
                  } text-sm`}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-6 sm:mb-12">
          {[
            {
              step: "01",
              title: "Join the Madness",
              description:
                "Sign up or log in to enter the playoff action. It’s fast, free, and takes just a minute.",
            },
            {
              step: "02",
              title: "Make Your Predictions",
              description:
                "Choose which teams you think will win each series. Predict match outcomes, game counts, and player stats.",
            },
            {
              step: "03",
              title: "Compete with Friends",
              description:
                "Create or join leagues and go head-to-head with your friends to see who really knows basketball.",
            },
          ].map(({ step, title, description }) => (
            <div
              key={step}
              className={`relative  rounded-xl shadow-lg p-6 hover:-translate-y-2 transition-all duration-300 ${
                step === "02"
                  ? "bg-gradient-to-br from-colors-nba-blue to-blue-600"
                  : "bg-white"
              }`}
            >
              <div className="absolute -top-4 -left-4 bg-colors-nba-yellow text-white font-bold w-10 h-10 flex items-center justify-center rounded-full shadow-md">
                {step}
              </div>
              <h3
                className={`${
                  step === "02" ? "text-white" : "text-gray-800"
                } text-xl font-bold text-gray-800 mb-2`}
              >
                {title}
              </h3>
              <p
                className={`${
                  step === "02" ? "text-white" : "text-gray-600"
                } text-sm`}
              >
                {description}
              </p>
            </div>
          ))}
        </div>

        {/* Centered Video */}
        <div className="flex justify-center px-2">
          <video
            controls
            className="rounded-md shadow-md w-1/2 max-w-lg"
            src={Demo}
            poster={cover}
            height="800"
            width="1280"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </section>
    </div>
  );
};

export default WelcomePage;
