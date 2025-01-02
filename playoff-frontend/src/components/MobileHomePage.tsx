import React, { useState } from "react";
// import NBASeedCard from "../components/NBASeedCard";
import { Series } from "../pages/HomePage"; // Assuming Series interface is imported
// import NBALogo from "../assets/NBALogo.jpg"; // Placeholder for "waiting for matchup"
// import TeamDialog from "../components/form/TeamDialog"; // Import TeamDialog

const MobileMatchupList: React.FC<{ series: { west: Series[]; east: Series[] } }> = ({ series }) => {
    const [open, setOpen] = useState(1);

    const toggleAccordion = (index: number) => {
      setOpen(open === index ? 0 : index);
    };
  
    return (
      <div>
        {/* Accordion Item 1 */}
        <h2>
          <button
            type="button"
            className="flex items-center justify-between w-full p-5 font-medium text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
            onClick={() => toggleAccordion(1)}
          >
            <span>What is Flowbite?</span>
            <svg
              className={`w-3 h-3 shrink-0 transform transition-transform ${open === 1 ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5 5 1 1 5"
              />
            </svg>
          </button>
        </h2>
        {open === 1 && (
          <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
            <p className="mb-2 text-gray-500 dark:text-gray-400">
              Flowbite is an open-source library of interactive components built on top of Tailwind CSS including buttons, dropdowns, modals, navbars, and more.
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Check out this guide to learn how to{' '}
              <a href="/docs/getting-started/introduction/" className="text-blue-600 dark:text-blue-500 hover:underline">
                get started
              </a>{' '}
              and start developing websites even faster with components on top of Tailwind CSS.
            </p>
          </div>
        )}
  
        {/* Accordion Item 2 */}
        <h2>
          <button
            type="button"
            className="flex items-center justify-between w-full p-5 font-medium text-gray-500 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
            onClick={() => toggleAccordion(2)}
          >
            <span>Is there a Figma file available?</span>
            <svg
              className={`w-3 h-3 shrink-0 transform transition-transform ${open === 2 ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5 5 1 1 5"
              />
            </svg>
          </button>
        </h2>
        {open === 2 && (
          <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700">
            <p className="mb-2 text-gray-500 dark:text-gray-400">
              Flowbite is first conceptualized and designed using the Figma software so everything you see in the library has a design equivalent in our Figma file.
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Check out the{' '}
              <a href="https://flowbite.com/figma/" className="text-blue-600 dark:text-blue-500 hover:underline">
                Figma design system
              </a>{' '}
              based on the utility classes from Tailwind CSS and components from Flowbite.
            </p>
          </div>
        )}
  
        {/* Accordion Item 3 */}
        <h2>
          <button
            type="button"
            className="flex items-center justify-between w-full p-5 font-medium text-gray-500 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
            onClick={() => toggleAccordion(3)}
          >
            <span>What are the differences between Flowbite and Tailwind UI?</span>
            <svg
              className={`w-3 h-3 shrink-0 transform transition-transform ${open === 3 ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5 5 1 1 5"
              />
            </svg>
          </button>
        </h2>
        {open === 3 && (
          <div className="p-5 border border-t-0 border-gray-200 dark:border-gray-700">
            <p className="mb-2 text-gray-500 dark:text-gray-400">
              The main difference is that the core components from Flowbite are open source under the MIT license, whereas Tailwind UI is a paid product. Another difference is that Flowbite relies on smaller and standalone components, whereas Tailwind UI offers sections of pages.
            </p>
            <p className="mb-2 text-gray-500 dark:text-gray-400">
              However, we actually recommend using both Flowbite, Flowbite Pro, and even Tailwind UI as there is no technical reason stopping you from using the best of two worlds.
            </p>
            <p className="mb-2 text-gray-500 dark:text-gray-400">Learn more about these technologies:</p>
            <ul className="ps-5 text-gray-500 list-disc dark:text-gray-400">
              <li>
                <a href="https://flowbite.com/pro/" className="text-blue-600 dark:text-blue-500 hover:underline">
                  Flowbite Pro
                </a>
              </li>
              <li>
                <a href="https://tailwindui.com/" rel="nofollow" className="text-blue-600 dark:text-blue-500 hover:underline">
                  Tailwind UI
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
};

export default MobileMatchupList;
