'use client'

import { FcOvertime } from 'react-icons/fc';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { CardBlockUI } from './card-block.module';
import { Button } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Timer } from 'lucide-react';
import { homePageConfig, START_DATE, TARGET_DATE } from '@/config/frontend/homePage.config';

export const MissionCountdownCard = ({ className }: { className?: string }) => {



  const d = new Date();
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Number(d));


  // ! DERIVED STATE CALCULATIONS (Memoized for performance)
  const {
    days,
    hours,
    minutes,
    seconds,
    percentageElapsed,
    totalDaysRemaining,
  } = useMemo(() => {
    // * Calculate exact bounds
    const totalTimeSpanMs = Math.max(
      1,
      TARGET_DATE.getTime() - START_DATE.getTime(),
    );
    const timeLeftMs = Math.max(0, TARGET_DATE.getTime() - currentTimeMs);

    // * Time breakdown math
    const d = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
    const h = Math.floor(
      (timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const m = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

    // * Progress calculations
    const percentageRemaining = (timeLeftMs / totalTimeSpanMs) * 100;
    // ? Bounded between 0 and 100 to prevent layout shifts or bar overflow
    const pElapsed = Math.min(100, Math.max(0, 100 - percentageRemaining));

    return {
      days: d,
      hours: h,
      minutes: m,
      seconds: s,
      percentageElapsed: pElapsed,
      totalDaysRemaining: d * 24 + h, // * Original metric calculation preserved
    };
  }, [currentTimeMs]);


  useEffect(() => {
    const timerInterval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  return (
    <Card className={cn('relative overflow-hidden my-2 border border-primary/30 rounded-4xl', className)}>
      <CardHeader >
        <CardTitle className='flex items-center gap-3 '>
          <FcOvertime />
          <Button variant={'ghost'} className='text-lg font-badge' asChild>
            <Link href={'/'}>
              Mission Countdown
            </Link>
          </Button>
        </CardTitle>
        <CardDescription>
          Tracking progress towards your ultimate goal.
        </CardDescription>
        <CardAction>
          <Badge
            variant='secondary'
            className='bg-accent/50 px-4 py-2 text-sm backdrop-blur-md transition-colors hover:bg-accent/70 shadow-sm border border-border/50'>
            <Timer className='mr-2 h-4 w-4' />
            {percentageElapsed.toFixed(7)}% Elapsed
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <CardBlockUI
          cardBlockUIContentList={[
            {
              label: 'Days',
              value: String(days),
              subtext: `of ${homePageConfig.TOTAL_DAYS} total`,
            },
            {
              label: 'Hours',
              value: String(hours).padStart(2, '0'),
              subtext: `${totalDaysRemaining} total left`,
            },
            { label: 'Minutes', value: String(minutes).padStart(2, '0') },
            {
              label: 'Seconds',
              value: String(seconds).padStart(2, '0'),
              animate: true,
            },
          ]}
        />
      </CardContent>
      <CardFooter className='w-full rounded-full border border-primary/30 px-10 py-6 space-y-4'>
        <div className='w-full'>
          <div className='flex justify-between items-end text-sm font-medium'>
            <span className='text-muted-foreground'>
              Overall Timeline Progress
            </span>
            <span className='text-primary text-lg font-bold'>
              {Math.round(percentageElapsed)}%
            </span>
          </div>

          {/* * Shadcn Progress with customized height and inner shadow styling */}
          <div className='relative overflow-hidden rounded-full bg-accent/50 p-1 shadow-inner'>
            <Progress
              value={percentageElapsed}
              className='h-3 rounded-full bg-transparent [&>div]:bg-linear-to-r [&>div]:from-primary [&>div]:to-primary/80'
              aria-label='Countdown Progress'
            />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
