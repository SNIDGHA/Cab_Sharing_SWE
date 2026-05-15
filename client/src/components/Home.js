import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Typewriter from 'typewriter-effect';
import { PacmanLoader } from 'react-spinners';

const Home = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1200); // Reduced loading time for better UX
        return () => clearTimeout(timer);
    }, []);

    const goToRides = () => {
        navigate('/rides');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
                <PacmanLoader size={40} margin={2} color={"#4f46e5"} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 font-sans">
            
            {/* --- Hero Section --- */}
            <div className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40 text-center px-4">
                {/* Decorative background blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-100 to-transparent blur-3xl rounded-full opacity-60 -z-10 pointer-events-none"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-6 shadow-sm border border-indigo-200">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        The smart way to travel
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-4">
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 leading-tight">
                            <Typewriter
                                onInit={(typewriter) => {
                                    typewriter
                                        .typeString('GoTogether.')
                                        .pauseFor(2000)
                                        .deleteAll()
                                        .typeString('Share Rides.')
                                        .pauseFor(2000)
                                        .deleteAll()
                                        .typeString('Save Money.')
                                        .start();
                                }}
                                options={{
                                    loop: true,
                                    wrapperClassName: "Typewriter__wrapper"
                                }}
                            />
                        </span>
                    </h1>
                    
                    <p className="mt-6 text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium">
                        Connecting your journeys. Meet interesting people, reduce your carbon footprint, and split travel costs.
                    </p>
                    
                    <div className="mt-10 flex justify-center gap-4">
                        <button
                            onClick={goToRides}
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-4 px-10 rounded-2xl text-lg transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-1"
                        >
                            Find a Ride Now
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Features Section (Bento Grid Style) --- */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                    
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md group">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                            🤝
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Share Your Ride</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Meet interesting people and split the costs by sharing your commute. Create meaningful connections on the road.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md group">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                            🌱
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Go Green</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Reduce your carbon footprint by carpooling. Fewer cars on the road means a healthier planet for everyone.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md group">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                            💰
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Save Money</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Cut down your travel expenses significantly. Our dynamic pricing ensures everyone pays their fair share.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- Testimonials Section --- */}
            <div className="max-w-4xl mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900">Loved by Commuters</h2>
                </div>
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
                    
                    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-white relative">
                        <div className="text-4xl text-indigo-200 absolute top-4 right-6 font-serif">"</div>
                        <p className="text-slate-700 text-lg mb-6 relative z-10 font-medium">
                            Finding rides has never been easier! I love how simple and convenient GoTogether makes carpooling.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-400 to-blue-400 flex items-center justify-center text-white font-bold">
                                A
                            </div>
                            <p className="text-slate-900 font-semibold">Amali</p>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-white relative">
                        <div className="text-4xl text-indigo-200 absolute top-4 right-6 font-serif">"</div>
                        <p className="text-slate-700 text-lg mb-6 relative z-10 font-medium">
                            I've met some incredible people through this app. It's not just about sharing rides, it's about sharing experiences.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                                T
                            </div>
                            <p className="text-slate-900 font-semibold">Tanisha</p>
                        </div>
                    </div>

                </div>
            </div>
            
        </div>
    );
};

export default Home;
