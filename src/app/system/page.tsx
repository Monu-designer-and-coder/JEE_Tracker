/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { STORAGE_KEYS } from '@/config/constants';
import { useEffect, useState } from 'react';

export default function SyllabusHomePage() {
    // ! HYDRATION & STATE MANAGEMENT
    // * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [currentStudySession, setCurrentStudySession] = useState({
        isStudySessionActive: false,
        subjectDetails: {
            _id: '',
            subjectName: 'No Study Session',
        },
        sessionStartTime: 0,
    });

    // ! SIDE EFFECTS
    useEffect(() => {
        setIsMounted(true);
        setIsLoading(false);

        const initialStateOfStudySession = {
            isStudySessionActive: false,
            subjectDetails: {
                _id: '',
                subjectName: 'No Study Session',
            },
            sessionStartTime: 0,
        };
        const StudySessionLocalStorage = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.STUDY_SESSION) ||
                JSON.stringify(initialStateOfStudySession),
        );

        setCurrentStudySession(StudySessionLocalStorage);
    }, []);

    // ! HYDRATION FALLBACK
    // * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
    if (!isMounted) {
        return (
            <div className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
        );
    }

    return (
        <main className='relative min-h-[80vh] w-full overflow-hidden bg-background px-4 py-8 md:px-8'>
            {/* * Ambient Background Effects (Aceternity / Minimalist styling) */}
            <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
                <div className='absolute -left-[10%] top-[20%] h-125 w-125 rounded-full bg-primary/10 blur-[120px] mix-blend-screen' />
                <div className='absolute right-[5%] top-[10%] h-100 w-100 rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen' />
            </div>

            {/* * Content Section */}
            <section className='relative z-10 mx-auto max-w-7xl h-[80vh] flex flex-col justify-center'>
                {isLoading ? (
                    // * Loading State
                    <div className='flex h-64 items-center justify-center'>
                        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
                    </div>
                ) :  (
					<div className="w-full h-full">
                    <h1 className='text-primary text-6xl font-black'>SYSTEM</h1>
                    <h2
							className={`text-4xl ${currentStudySession.isStudySessionActive ? 'bg-primary' : 'text-destructive '} rounded-full px-7 py-4 my-5 mx-2 font-mono`}>
							Current Study Session:
							{''}
							{currentStudySession.subjectDetails.subjectName}{' '}
						</h2>
                    </div>
				)}
            </section>
        </main>
    );
}
