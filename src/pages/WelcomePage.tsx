import { Link } from "react-router-dom";
import PageBackground from "../components/common/PageBackground";
import Logo from "../assets/siteLogo/gray_trans.png";

const WelcomePage = () => {
  return (
    <div className=" flex flex-col items-center justify-center bg-gray-100 p-4 sm:p-8">
      {/* Background (Hidden on Mobile, Centered on Desktop) */}
      <div className="absolute inset-0 hidden sm:flex">
        <PageBackground imageSrc={Logo} />
      </div>

      {/* Welcome Card */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-75 text-white text-center p-6 sm:p-12 rounded-3xl shadow-2xl max-w-4xl w-full z-10">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 sm:mb-8">
          Welcome to Beyond the Bracket!
        </h1>
        <p className="text-lg sm:text-xl mb-6 sm:mb-8 font-semibold">
          Dive into the NBA Playoffs like never before. Place your bets, compete
          with friends, and see who's the real NBA expert!
        </p>

        {/* Buttons - Stack on Mobile */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
          <Link to="/signup">
            <button className="bg-gradient-to-r from-colors-nba-yellow to-colors-nba-red text-white py-3 px-8 sm:py-4 sm:px-12 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 w-full sm:w-auto">
              Sign Up and Play!
            </button>
          </Link>
          <Link to="/login">
            <button className="bg-gradient-to-r from-colors-nba-blue to-blue-400 text-white py-3 px-8 sm:py-4 sm:px-12 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 w-full sm:w-auto">
              Login to Join
            </button>
          </Link>
        </div>

        <p className="text-base sm:text-lg opacity-80 mt-4 sm:mt-6">
          Join thousands of NBA fans and make your predictions. Are you ready to
          prove you're the best?
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
