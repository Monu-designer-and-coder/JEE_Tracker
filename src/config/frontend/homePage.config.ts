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
export const TARGET_DATE_: Date = new Date('February 1, 2027 00:00:00');
export const TARGET_DATE__: Date = new Date('April 1, 2027 00:00:00');
export const TARGET_DATE___: Date = new Date('May 1, 2027 00:00:00');
export const START_DATE: Date = new Date('April 20, 2026 00:00:00');
export const START_DATE_: Date = new Date('January 1, 2027 00:00:00');
export const START_DATE__: Date = new Date('February 1, 2027 00:00:00');
export const TOTAL_DAYS = Math.floor(
    (TARGET_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24),
);

export const homePageConfig: homePageConfig = {
    TOTAL_DAYS
}