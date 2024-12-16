import BoroughLogo from '../assets/Borough-logo.svg';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react"
import waveIllo from '../assets/wave-illo.png';
import sortIllo from '../assets/sortImage.png';
import asset1 from '../assets/UI asset-marketing-01.jpg';
import asset2 from '../assets/report-mockup-2.jpg';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

import house1 from '../assets/homes/home1.jpg';
import house2 from '../assets/homes/home2.jpg';
import house3 from '../assets/homes/home3.jpg';
import house4 from '../assets/homes/home4.jpg';
import house5 from '../assets/homes/home5.jpg';
import house6 from '../assets/homes/home6.jpg';
import house7 from '../assets/homes/home7.jpg';
import house8 from '../assets/homes/home8.jpg';
import house9 from '../assets/homes/home9.jpg';
import house10 from '../assets/homes/home10.jpg';
import house11 from '../assets/homes/home11.jpg';
import house12 from '../assets/homes/home12.jpg';
import house13 from '../assets/homes/home13.jpg';
import house14 from '../assets/homes/home14.jpg';
import house15 from '../assets/homes/home15.jpg';


const carouselImages = [
    { src: house1, width: '200px' },
    { src: house2, width: '300px' },
    { src: house3, width: '300px' },
    { src: house4, width: '300px' },
    { src: house5, width: '500px' },
    { src: house6, width: '300px' },
    { src: house7, width: '300px' },
    { src: house8, width: '300px' },
    { src: house9, width: '500px' },
];


const mixedSlides = [
    {
        type: 'text',
        content: <span>Save time,<br />stress less</span>,
        width: '550px',
        color: '#E6E2DD',
    },
    {
        type: 'image',
        content: house9,
        width: '300px',
        color: '#FFB252',
    },
    {
        type: 'text',
        content: "Ask the right questions",
        width: '450px',
        color: '#FFB252',
    },
    {
        type: 'image',
        content: house10,
        width: '300px',
        color: '#E6E2DD',
    },
    {
        type: 'text',
        content: <span>The right home <br />at theright price</span>,
        width: '650px',
        color: '#FFB252',
    },
    {
        type: 'image',
        content: house11,
        width: '300px',
        color: '#E6E2DD',
    },
    // ... add more slides here
];

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
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className="size-10 stroke-[#395E44] p-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <span>Detailed Cost Estimates</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className="size-10 stroke-[#395E44] p-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <span>Interactive Report Dashboard</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"  className="size-10 stroke-[#395E44]  p-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <span>Priority Ranked Findings</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* CAROUSEL 1 */}
            <div className="w-screen my-10"
                style={{
                    width: '100vw',
                    position: 'relative',
                    left: '50%',
                    transform: 'translateX(-50%)',
                }} >
                <Swiper
                    slidesPerView="auto"
                    spaceBetween={30}
                    loop={true}
                    speed={8000}
                    autoplay={{
                        delay: 0,
                        disableOnInteraction: false,
                    }}
                    modules={[Autoplay]}
                >
                    {carouselImages.map((image, index) => (
                        <SwiperSlide key={index} style={{ width: image.width }}>
                            <img
                                src={image.src}
                                alt={`house${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '250px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                }}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div className="relative rounded-3xl sm:p-8 my-10 h-auto sm:h-[700px] relative" style={{ backgroundColor: '#E6E2DD' }}>
                <div className="mx-auto max-w-6xl px-4 my-10 py-5">
                    {/* Mobile Image - Shows on top for mobile */}
                    <div className="w-full h-[300px] lg:hidden rounded-xl overflow-hidden mb-8">
                        <img
                            src={asset2}
                            alt="Report Preview"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Text Content - Shows below image on mobile */}
                    <div className="flex flex-col lg:hidden mb-8 space-y-6">
                        <img
                            src={waveIllo}
                            alt="Borough Logo"
                            className="w-32 sm:w-48 ml-0 sm:ml-10"
                        />
                        <h1 className="text-[#395E44] text-3xl sm:text-4xl font-nohemi leading-tight">
                            Goodbye to Overly Complex Reports
                        </h1>
                        <p className="text-[#395E44] text-lg sm:text-xl font-nohemi leading-tight">
                            Borough platform translates complex inspection jargon and into a simple, actionable insights, helping you understand what really matters.
                        </p>
                    </div>

                    {/* Desktop Layout - Hidden on mobile */}
                    <div className="hidden lg:grid grid-cols-2 gap-12 items-center min-h-[500px]">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <img
                                src={waveIllo}
                                alt="Borough Logo"
                                className="w-48 ml-10"
                            />
                            <h1 className="text-[#395E44] text-5xl font-nohemi leading-tight">
                                Goodbye to Overly Complex Reports
                            </h1>
                            <p className="text-[#395E44] text-xl font-nohemi leading-tight">
                                Borough platform translates complex inspection jargon and into a simple, actionable insights, helping you understand what really matters.
                            </p>
                        </div>

                        {/* Right Column */}
                        <div className="absolute w-1/2 right-0 top-0 h-[675px] rounded-r-xl m-[13px] overflow-hidden">
                            <img
                                src={asset2}
                                alt="debug"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>


            <div className="w-screen my-10"
                style={{
                    width: '100vw',
                    position: 'relative',
                    left: '50%',
                    transform: 'translateX(-50%)',
                }} >
                <Swiper
                    slidesPerView="auto"
                    spaceBetween={30}
                    loop={true}
                    speed={8000}
                    autoplay={{
                        delay: 0,
                        disableOnInteraction: false,
                    }}
                    modules={[Autoplay]}
                >
                    {mixedSlides.map((slide, index) => (
                        <SwiperSlide key={index} style={{ width: slide.width }}>
                            {slide.type === 'text' ? (
                                <div
                                    style={{
                                        backgroundColor: slide.color,
                                        padding: '20px',
                                        borderRadius: '150px',
                                        height: '250px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <p className="text-[#395E44] text-[38px] font-nohemi font-bold text-center leading-10">
                                        {slide.content}
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={slide.content}
                                    alt={`slide-${index}`}
                                    style={{
                                        width: '100%',
                                        height: '250px',
                                        objectFit: 'cover',
                                        borderRadius: '16px'
                                    }}
                                />
                            )}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div className="rounded-3xl sm:p-8 my-10 h-auto sm:h-[700px] relative" style={{ backgroundColor: '#E6E2DD' }}>
                <div className="mx-auto max-w-6xl px-4 my-10 py-5">
                    {/* Mobile Image - Shows on top for mobile */}
                    <div className="w-full h-[300px] lg:hidden rounded-xl overflow-hidden mb-8">
                        <img
                            src={asset1}
                            alt="debug"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Mobile Text Content - Shows below image */}
                    <div className="flex flex-col lg:hidden mb-8 space-y-6">
                        <img
                            src={sortIllo}
                            alt="Illustration of two arrows pointing in opposite directions"
                            className="w-24 ml-0 sm:ml-10"
                        />
                        <h1 className="text-[#395E44] text-3xl sm:text-4xl font-nohemi leading-tight">
                            Know what needs to get done first...
                        </h1>
                        <p className="text-[#395E44] text-lg sm:text-xl font-nohemi leading-tight">
                            ...and what can wait. Borough prioritizes repairs tasks by urgency so you know what's an immediate cost and what can be saved for later.
                        </p>
                        <button
                            onClick={() => navigate('/subscribe')}
                            className="hidden lg:block bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-2xl text-lg font-bold hover:bg-opacity-90 transition-colors mt-8"
                        >
                            Sign Up Now
                        </button>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:grid grid-cols-2 gap-12 items-center min-h-[500px]">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <img
                                src={sortIllo}
                                alt="Illustration of two arrows pointing in opposite directions"
                                className="w-24 ml-10"
                            />
                            <h1 className="text-[#395E44] text-5xl font-nohemi leading-tight">
                                Know what needs to get done first...
                            </h1>
                            <p className="text-[#395E44] text-xl font-nohemi leading-tight">
                                ...and what can wait. Borough prioritizes repairs tasks by urgency so you know what's an immediate cost and what can be saved for later.
                            </p>
                            <button
                                onClick={() => navigate('/subscribe')}
                                className="hidden lg:block bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-2xl text-lg font-bold hover:bg-opacity-90 transition-colors mt-8"
                            >
                                Sign Up Now
                            </button>
                        </div>

                        {/* Right Column */}
                        <div className="absolute w-1/2 right-0 top-0 h-[675px] rounded-r-xl m-[13px] overflow-hidden">
                            <img
                                src={asset1}
                                alt="debug"
                                className="w-full h-full object-cover overflow-hidden"
                            />
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