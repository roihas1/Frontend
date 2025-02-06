import { Link } from "react-router-dom";
import PageBackground from "../components/common/PageBackground";
import Logo from "../assets/siteLogo/gray_trans.png";

const WelcomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t  bg-cover bg-center mt-2">
      <PageBackground imageSrc={Logo} />
      <div className="bg-gray-900 bg-opacity-75 text-white text-center p-12 rounded-3xl shadow-2xl max-w-4xl w-full transform transition-all ">
        <h1 className="text-6xl font-extrabold text-white mb-8">
          Welcome to Beyond the Bracket!
        </h1>
        <p className="text-xl mb-8 font-semibold">
          Dive into the NBA Playoffs like never before. Place your bets, compete
          with friends, and see who's the real NBA expert!
        </p>
        <div className="flex justify-center gap-8 mb-8">
          <Link to="/signup">
            <button className="bg-gradient-to-r from-colors-nba-yellow to-colors-nba-red text-white py-4 px-12 rounded-full text-lg font-semibold hover:scale-110 transform transition-all duration-300">
              Sign Up and Play!
            </button>
          </Link>
          <Link to="/login">
            <button className="bg-gradient-to-r from-colors-nba-blue to-blue-400 text-white py-4 px-12 rounded-full text-lg font-semibold hover:scale-110 transform transition-all duration-300">
              Login to Join
            </button>
          </Link>
        </div>
        <p className="text-lg opacity-80 mt-6">
          Join thousands of NBA fans and make your predictions. Are you ready to
          prove you're the best?
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
