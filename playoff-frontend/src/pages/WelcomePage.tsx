import { Link } from "react-router-dom";
import PageBackground from "../components/Layout/PageBackground";
import Logo from '../assets/export/gray_trans.png'


const WelcomePage = () => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-center"
    >
      <PageBackground imageSrc={Logo} />
      <div className="bg-gray-600 bg-opacity-60 text-white text-center p-12 rounded-3xl shadow-2xl max-w-3xl w-full transform transition-all duration-300 hover:scale-105">
      
        <h1 className="text-5xl font-extrabold text-white mb-6">
          Welcome to the Ultimate NBA Playoffs Betting App!
        </h1>
        <p className="text-xl mb-8">
          Experience the excitement of the NBA Playoffs like never before. Place
          your bets, compete with friends, and see who knows the game best!
        </p>
        <div className="flex justify-center gap-6 mb-8">
          <Link to="/signup">
            <button className="bg-gradient-to-r from-colors-nba-blue to-colors-nba-red text-white py-3 px-10 rounded-full text-lg font-semibold hover: transform transition-all duration-300 hover:scale-105">
              Sign Up and Start Winning!
            </button>
          </Link>
          <Link to="/login">
            <button className="bg-gradient-to-r  from-colors-nba-red to-colors-nba-blue text-white py-3 px-10 rounded-full text-lg font-semibold hover: transform transition-all duration-300 hover:scale-105">
              Login
            </button>
          </Link>
        </div>
        <p className="text-lg opacity-70 mt-6">
          Join thousands of fans who are making their NBA Playoffs predictions
          right now!
        </p>
      </div>

      <footer className="mt-12 text-white text-sm opacity-80">
        <p>Powered by Your NBA Playoffs Betting App</p>
      </footer>
    </div>
  );
};

export default WelcomePage;
