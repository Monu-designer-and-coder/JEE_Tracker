export interface homePageConfig {
    TOTAL_DAYS: number;
}
export interface timeDetails {
    hours: number;
    minutes: number;
    seconds: number;
}
export interface ClockTimeDetails extends timeDetails {
    date: string;
}
export interface TimeBreakdown extends timeDetails {
    days: number;
}

//! Constants 
export const TARGET_DATE: Date = new Date('January 1, 2027 00:00:00');
export const START_DATE: Date = new Date('April 20, 2026 00:00:00');
const TOTAL_DAYS = Math.floor(
    (TARGET_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24),
);

export const homePageConfig: homePageConfig = {
    TOTAL_DAYS
}