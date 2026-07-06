import Logo from "../assets/siteLogo/logo_color_trans.png";
import Title from "../assets/siteLogo/title_straight_shadow.png";
import GrayLogo from "../assets/siteLogo/gray_trans.png";

const statusItems = [
  { label: "Brackets", value: "Closed" },
  { label: "Leagues", value: "Paused" },
  { label: "Return", value: "Next postseason" },
] as const;

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="border-b-2 border-gray-200 bg-gray-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-center gap-3">
          <img src={Logo} alt="Beyond the Bracket logo" className="h-12 w-auto" />
          <img
            src={Title}
            alt="Beyond the Bracket"
            className="h-10 w-auto hidden sm:block"
          />
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 flex justify-center items-center opacity-[0.07] pointer-events-none">
          <img src={GrayLogo} alt="" className="w-64 sm:w-96" aria-hidden="true" />
        </div>

        <div className="relative z-10 w-full max-w-xl">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-colors-nba-yellow via-colors-nba-red to-colors-nba-blue" />

            <div className="px-6 sm:px-10 py-10 sm:py-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-colors-nba-yellow to-colors-nba-red text-white text-sm font-semibold shadow-md mb-8">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
                Off-season maintenance
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                See you next{" "}
                <span className="text-colors-nba-blue">postseason</span>
              </h1>

              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 max-w-md mx-auto">
                The NBA Playoffs have wrapped up, so Beyond the Bracket is
                closed for the off-season. We will be back when the next
                postseason tips off.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {statusItems.map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-4"
                  >
                    <p className="text-sm font-bold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500 mt-1">{value}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-400">
                Thanks for playing this year. We are excited to welcome you back
                for the next playoff run.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-colors-nba-blue text-white py-4 text-center text-sm">
        © {new Date().getFullYear()} Beyond the Bracket. All rights reserved.
      </footer>
    </div>
  );
};

export default MaintenancePage;
