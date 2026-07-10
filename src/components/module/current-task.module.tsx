'use client'

import { FcLink, FcSurvey } from 'react-icons/fc';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { CardBlockUI } from './card-block.module';
import { Button } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { axiosConfig } from '@/config/axios.config';

export const CurrentTaskCard = ({ className }: { className?: string }) => {
  const [currentTask, setCurrentTask] = useState<{
    _id: string;
    task: string;
    seqNumber: number;
    assignDate: Date;
  }>({
    _id: 'loading',
    task: 'loading',
    seqNumber: 0,
    assignDate: new Date(),
  });

  const [currentTime, setCurrentTime] = useState(
    new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hourCycle: 'h23',
    }).format(new Date()),
  );

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setCurrentTime(
        new Intl.DateTimeFormat('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hourCycle: 'h23',
        }).format(new Date()),
      );
    }, 1000);

    axios.request(axiosConfig('system/task/', 'get')).then(
      (
        response: AxiosResponse<{
          _id: string;
          task: string;
          seqNumber: number;
          assignDate: Date;
        }>,
      ) => {
        const responseData = response.data;
        setCurrentTask(responseData);
      },
    );

    return () => clearInterval(timerInterval);
  }, []);

  return (
    <Card
      className={cn(
        'relative overflow-hidden',
        '[--card-spacing:--spacing(8)]',
        'border border-primary/30 rounded-4xl',
        className,
      )}>
      {/* ? HEADER SECTION */}
      <CardHeader>
        <CardTitle className='flex items-center gap-3 '>
          <FcSurvey />
          <Button variant={'ghost'} className='text-lg font-badge' asChild>
            <Link href={'/system/task'}>To Do:</Link>
          </Button>
        </CardTitle>
        <CardDescription>To this Task Now!</CardDescription>
        <CardAction>
          <Button variant='link' asChild>
            <Link href={'/system/task'}>
              <FcLink className='w-5 h-5' />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-center my-4 w-11/12 mx-auto'>
          <CardBlockUI
            className='grid-cols-1'
            cardBlockUIContentList={[
              {
                label: 'Do this Current Task',
                value: currentTask.task,
                subtext: '',
                animate: true,
              },
            ]}
          />
        </div>
        <div className='flex items-center justify-center my-4 w-11/12 mx-auto'>
          <CardBlockUI
            className='grid-cols-1'
            cardBlockUIContentList={[
              {
                label: 'Sequence Number of the Task:',
                value: String(currentTask.seqNumber),
                subtext: '',
                animate: false,
              },
              {
                label: 'Time Assigned',
                value: new Intl.DateTimeFormat('en-IN', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hourCycle: 'h24',
                }).format(new Date(currentTask.assignDate)),
                subtext: new Intl.DateTimeFormat('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hourCycle: 'h24',
                }).format(new Date(currentTask.assignDate)),
                animate: false,
              },
            ]}
          />
        </div>
        <div className='flex items-center justify-center my-4 w-11/12 mx-auto'>
          <CardBlockUI
            className='grid-cols-1'
            cardBlockUIContentList={[
              {
                label: 'Time',
                value: currentTime,
                subtext: '',
                animate: true,
              },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
};
