import BoroughLogo from '../assets/Borough-logo.svg';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react"
import waveIllo from '../assets/wave-illo.png';
import sortIllo from '../assets/sortImage.png';
import asset1 from '../assets/UI asset-marketing-01.jpg';
import asset2 from '../assets/report-mockup-2.jpg';
import carousel from '../assets/image-carousel.png';
import carousel2 from '../assets/image-carousel-02.png';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <>
            <div className="rounded-b-3xl sm:p-8" style={{ backgroundColor: '#E6E2DD' }}>
                <div className="mx-auto w-full max-w-[1250px] px-4 flex-grow">
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{
                            y: 0,
                            opacity: 1,
                            transition: { duration: 0.4, type: 'easeOut', stiffness: 100 }
                        }}
                    >
                        <div className="container mx-auto max-w-6xl px-4 py-12">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                {/* Left Column */}
                                <div className="lg:col-span-1 space-y-6">
                                    <img
                                        src={BoroughLogo}
                                        alt="Borough Logo"
                                        className="w-24 mb-6"
                                    />
                                    <h1 className="text-[#395E44] text-4xl sm:text-5xl lg:text-6xl font-nohemi leading-tight">
                                        Your Inspection Reports, Simplified and Actionable
                                    </h1>
                                    <button
                                        onClick={() => navigate('/subscribe')}
                                        className="bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-2xl text-lg font-bold hover:bg-opacity-90 transition-colors mt-8"
                                    >
                                        Get Started
                                    </button>
                                </div>

                                {/* Right Column */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="flex items-center space-x-4 text-lg">
                                        <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center">
                                            <span className="text-white">✓</span>
                                        </div>
                                        <span>Detailed Cost Estimates</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-lg">
                                        <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center">
                                            <span className="text-white">✓</span>
                                        </div>
                                        <span>Interactive Report Dashboard</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-lg">
                                        <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center">
                                            <span className="text-white">✓</span>
                                        </div>
                                        <span>Priority Ranked Findings</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <img
                src={carousel}
                alt="images of houses"
                className="w-screen my-10"
            />

            <div className="relative rounded-3xl sm:p-8 my-10 h-[700px] relative" style={{ backgroundColor: '#E6E2DD' }}>
                <div className="mx-auto max-w-6xl px-4 my-10 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px]">
                        {/* Left Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <img
                                src={waveIllo}
                                alt="Borough Logo"
                                className="w-48 ml-10 mb-6"
                            />
                            <h1 className="text-[#395E44] text-4xl sm:text-5xl lg:text-5xl font-nohemi leading-tight">
                                Goodbye to Overly Complex Reports
                            </h1>
                            <p className="text-[#395E44] text-xl sm:text-xl lg:text-xl font-nohemi leading-tight">
                                Borough platform translates complex inspection jargon and into a simple, actionable insights, helping you understand what really matters.
                            </p>
                            <button
                                onClick={() => navigate('/subscribe')}
                                className="bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-2xl text-lg font-bold hover:bg-opacity-90 transition-colors mt-8"
                            >
                                View Sample Report
                            </button>
                        </div>

                        {/* No Right Column here */}

                        <div className="absolute w-1/2 right-0 top-0 h-[675px] rounded-r-xl m-[13px]">
                            <img
                                src={asset1}
                                alt="debug"
                                className="w-full h-full object-cover rounded-r-xl"
                            />
                        </div>
                    </div>
                </div>

            </div>

            <img
                src={carousel2}
                alt="images"
                className="w-screen my-10"
            />

            <div className="rounded-3xl sm:p-8 my-10 h-[700px] relative" style={{ backgroundColor: '#E6E2DD' }}>
                <div className="mx-auto max-w-6xl px-4 my-10 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px]">
                        {/* Left Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <img
                                src={sortIllo}
                                alt="Illustration of two arrows pointing in opposite directions"
                                className="w-24 ml-10 mb-6"
                            />
                            <h1 className="text-[#395E44] text-4xl sm:text-5xl lg:text-5xl font-nohemi leading-tight">
                                Know what needs to get done first...
                            </h1>
                            <p className="text-[#395E44] text-xl sm:text-xl lg:text-xl font-nohemi leading-tight">
                                ...and what can wait. Borough prioritizes repairs tasks by urgency so you know what’s an immediate cost and what can be saved for later.
                            </p>
                            <button
                                onClick={() => navigate('/subscribe')}
                                className="bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-2xl text-lg font-bold hover:bg-opacity-90 transition-colors mt-8"
                            >
                                Sign Up Now
                            </button>
                        </div>
                        <div className="absolute w-1/2 right-0 top-0 h-[675px] rounded-r-xl m-[13px] bg-cover bg-center bg-no-repeat bg-white z-10"
                            style={{
                                backgroundImage: `url(${asset2})`,

                            }}
                        >
                        </div>
                    </div>
                </div>
            </div>
            <button
                onClick={() => navigate('/subscribe')}
                className="w-full bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-2xl text-lg font-bold hover:bg-opacity-90 transition-colors mt-8"
            >
                Get Started
            </button>

            <div className="rounded-t-3xl sm:p-8 mt-10 h-[200px] relative" style={{ backgroundColor: '#6D8671' }}>
    <div className="mx-auto max-w-6xl px-4 my-10">
        <div className="flex justify-between items-center"> {/* Changed to flex with justify-between */}
            {/* Left Column */}
            <div>
                <img
                    src={BoroughLogo}
                    alt="Borough Logo"
                    className="w-24 mb-6"
                />
            </div>
            <div className="flex space-x-6 text-white">
                <a href="/terms" className="hover:underline">Terms of Use</a>
                <a href="/contact" className="hover:underline">Contact</a>
            </div>
        </div>
    </div>
</div>
        </>
    );
}

export default LandingPage; 