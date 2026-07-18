'use client'

import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { FcDataSheet, FcLink } from "react-icons/fc";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { syllabusDetailedDataChapter } from "@/types/res/syllabusDataResponse.types";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";
import { LabelList, PolarGrid, RadialBar, RadialBarChart } from "recharts";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";


export const ChapterModularUI = ({ className, chapter }: { className?: string, chapter: syllabusDetailedDataChapter; }) => {

  // ! HYDRATION & STATE MANAGEMENT
  // * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
  const [isMounted, setIsMounted] = useState(false);



  // ! SIDE EFFECTS
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const chartConfig = {
    value: {
      label: "value"
    },
    topicsCompleted: {
      label: String(chapter.totalTopicsCompletedPercentage.toFixed(1)) + "%",
      color: "var(--chart-1)"
    },
    topicsTheory: {
      label: String(chapter.totalTopicsTheoryCompletedPercentage.toFixed(1)) + "%",
      color: "var(--chart-2)"
    },
    totalTopics: {
      label: "Total Topics",
      color: "var(--chart-3)"
    },
  } satisfies ChartConfig


  // ! HYDRATION FALLBACK
  // * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
  if (!isMounted) {
    return (
      <Skeleton className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
    );
  }


  return (
    <Card className={cn('relative overflow-hidden my-1', className)}>
      <CardHeader >
        <CardTitle className='flex items-center gap-3 '>
          <FcDataSheet />
          <Button variant={'ghost'} className='text-lg font-badge' asChild>
            <Link href={'/system/'}>
              {chapter.name}
            </Link>
          </Button>
        </CardTitle>
        <CardDescription>
          {(() => {
            const num = chapter.seqNumber;
            const j = num % 10;
            const k = num % 100;

            let suffix = "th";
            if (j === 1 && k !== 11) {
              suffix = "st";
            } else if (j === 2 && k !== 12) {
              suffix = "nd";
            } else if (j === 3 && k !== 13) {
              suffix = "rd";
            }

            return (
              <>
                This chapter is {num}<sup>{suffix}</sup> chapter of {chapter.subject.name.toUpperCase()}
              </>
            );
          })()}
        </CardDescription>
        <CardAction>
          <Button variant="link" asChild>
            <Link href={'/system/'}>
              <FcLink className="w-5 h-5" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className='grid grid-cols-12 grid-rows-6'>
        <div className="col-span-10 row-span-2 rounded-tl-xl p-3 grid grid-rows-5 grid-cols-10 gap-3">
          <div className="flex items-center gap-4 col-span-2 row-span-1">
            <Switch id={`${chapter._id}-done-checkbox`} checked={chapter.done} />
            <Label htmlFor={`${chapter._id}-done-checkbox`} className="capitalize text-3xl font-medium font-badges">done</Label>
          </div>
          <div className="flex items-center gap-4 col-span-2 row-span-1">
            <Switch id={`${chapter._id}-theory-checkbox`} checked={chapter.theory} />
            <Label htmlFor={`${chapter._id}-theory-checkbox`} className="capitalize text-3xl font-medium font-badges">theory</Label>
          </div>
          <div className="flex items-center gap-4 col-span-2 row-span-1">
            <Switch id={`${chapter._id}-shortNotes-checkbox`} checked={chapter.shortNotes} />
            <Label htmlFor={`${chapter._id}-shortNotes-checkbox`} className="capitalize">shortNotes</Label>
          </div>
          <div className="flex items-center gap-4 col-span-2 row-span-1">
            <Switch id={`${chapter._id}-mindMap-checkbox`} checked={chapter.mindMap} />
            <Label htmlFor={`${chapter._id}-mindMap-checkbox`} className="capitalize">mindMap</Label>
          </div>
          <div className="flex items-center gap-4 col-span-2 row-span-1">
            <Switch id={`${chapter._id}-DPP1-checkbox`} checked={chapter.DPP1} />
            <Label htmlFor={`${chapter._id}-DPP1-checkbox`} className="capitalize">DPP1</Label>
          </div>
          <div className="flex items-center gap-4 col-span-2 row-span-1">
            <Switch id={`${chapter._id}-DPP2-checkbox`} checked={chapter.DPP2} />
            <Label htmlFor={`${chapter._id}-DPP2-checkbox`} className="capitalize">DPP2</Label>
          </div>
          <div className="flex items-center gap-4 col-span-2 row-span-1">
            <Switch id={`${chapter._id}-Module-checkbox`} checked={chapter.Module} />
            <Label htmlFor={`${chapter._id}-Module-checkbox`} className="capitalize">Module</Label>
          </div>
          <div className="flex items-center gap-4 col-span-2 row-span-1">
            <Switch id={`${chapter._id}-PYQ_Mains-checkbox`} checked={chapter.PYQ_Mains} />
            <Label htmlFor={`${chapter._id}-PYQ_Mains-checkbox`} className="capitalize">PYQ_Mains</Label>
          </div>
          <div className="flex items-center gap-4 col-span-2 row-span-1">
            <Switch id={`${chapter._id}-PYQ_Advanced-checkbox`} checked={chapter.PYQ_Advanced} />
            <Label htmlFor={`${chapter._id}-PYQ_Advanced-checkbox`} className="capitalize">PYQ_Advanced</Label>
          </div>
          <div className="flex items-center gap-4 col-span-2 row-span-1">
            <Switch id={`${chapter._id}-Book-checkbox`} checked={chapter.Book} />
            <Label htmlFor={`${chapter._id}-Book-checkbox`} className="capitalize">Book</Label>
          </div>
          <div className='w-full rounded-full border border-primary/30 px-10 py-6 space-y-4 col-span-5 row-span-1'>
            <div className='w-full'>
              <div className='flex justify-between items-end text-sm font-medium'>
                <span className='text-muted-foreground'>
                  Total Topics Theory Completed : <Badge>{chapter.totalTopicsCompleted}/{chapter.totalTopics}</Badge>
                </span>
                <span className='text-primary text-lg font-bold'>
                  {(chapter.totalTopicsTheoryCompletedPercentage.toFixed(3))}%
                </span>
              </div>
              <div className='relative overflow-hidden rounded-full bg-accent/50 p-1 shadow-inner'>
                <Progress
                  value={chapter.totalTopicsTheoryCompletedPercentage}
                  className='h-3 rounded-full bg-transparent [&>div]:bg-linear-to-r [&>div]:from-primary [&>div]:to-primary/80'
                  aria-label='Countdown Progress'
                />
              </div>
            </div>
          </div>
          <div className='w-full rounded-full border border-primary/30 px-10 py-6 space-y-4 col-span-5 row-span-1'>
            <div className='w-full'>
              <div className='flex justify-between items-end text-sm font-medium'>
                <span className='text-muted-foreground'>
                  Total Topics Completed <Badge>{chapter.totalTopicsTheoryCompleted}/{chapter.totalTopics}</Badge>
                </span>
                <span className='text-primary text-lg font-bold'>
                  {(chapter.totalTopicsCompletedPercentage.toFixed(3))}%
                </span>
              </div>
              <div className='relative overflow-hidden rounded-full bg-accent/50 p-1 shadow-inner'>
                <Progress
                  value={chapter.totalTopicsCompletedPercentage}
                  className='h-3 rounded-full bg-transparent [&>div]:bg-linear-to-r [&>div]:from-primary [&>div]:to-primary/80'
                  aria-label='Countdown Progress'
                />
              </div>
            </div>
          </div>
          <div className="col-span-10 row-span-1 flex items-center justify-center">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="capitalize text-3xl font-medium font-badges text-ring">
                  {chapter.currentChapterStatus === "pending" ? (
                    <BreadcrumbPage className="font-heading text-4xl font-normal bg-muted/90 px-4 py-2 rounded-full ">Pending</BreadcrumbPage>
                  ) : (
                    "pending"
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="capitalize text-3xl font-medium font-badges text-informative-1">{chapter.currentChapterStatus === "upNext" ? (
                  <BreadcrumbPage className="font-heading text-4xl font-normal bg-informative-1/90 px-4 py-2 rounded-full ">up-Next</BreadcrumbPage>
                ) : (
                  "up-Next"
                )}</BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="capitalize text-3xl font-medium font-badges text-cautionary-1">{chapter.currentChapterStatus === "inProgress" ? (
                  <BreadcrumbPage className="font-heading text-4xl font-normal bg-cautionary-1/90 px-4 py-2 rounded-full ">in-Progress</BreadcrumbPage>
                ) : (
                  "in-Progress"
                )}</BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="capitalize text-3xl font-medium font-badges text-destructive-1">{chapter.currentChapterStatus === "unFinished" ? (
                  <BreadcrumbPage className="font-heading text-4xl font-normal bg-destructive-1/90 px-4 py-2 rounded-full ">unfinished</BreadcrumbPage>
                ) : (
                  "unfinished"
                )}</BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="capitalize text-3xl font-medium font-badges text-progressive-1">{chapter.currentChapterStatus === "done" ? (
                  <BreadcrumbPage className="font-heading text-4xl font-normal bg-progressive-1/90 px-4 py-2 rounded-full ">done</BreadcrumbPage>
                ) : (
                  "done"
                )}</BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <div className="col-span-2 row-span-2 rounded-tr-xl p-3 ">
          <ChartContainer
            config={chartConfig}
            className="aspect-square w-full"
          >
            <RadialBarChart
              data={[
                { Key: "totalTopics", value: chapter.totalTopics, fill: "var(--color-totalTopics)" },
                { Key: "topicsCompleted", value: chapter.totalTopicsCompleted, fill: "var(--color-topicsCompleted)" },
                { Key: "topicsTheory", value: chapter.totalTopicsTheoryCompleted, fill: "var(--color-topicsTheory)" }
              ]}
              startAngle={-90}
              endAngle={360 - 90}
              innerRadius={30}
              outerRadius={110}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="Key" />}
              />
              <PolarGrid gridType="circle" />
              <RadialBar dataKey="value" background>
                <LabelList
                  position="insideStart"
                  dataKey="Key"
                  className="fill-white capitalize mix-blend-luminosity"
                  fontSize={11}
                />
              </RadialBar>
            </RadialBarChart>
          </ChartContainer>

        </div>
        <div className="col-span-12 row-span-4 rounded-b-xl p-3">
          <Table>
            <TableCaption>Topics of the chapters</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>S.No.</TableHead>
                <TableHead>Topic Name</TableHead>
                <TableHead>Theory</TableHead>
                <TableHead>In-Text Qs</TableHead>
                <TableHead>In-Class Qs</TableHead>
                <TableHead>Done</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chapter.topicsList.map(topic => (
                <TableRow key={topic._id}>
                  <TableCell>{topic.seqNumber}</TableCell>
                  <TableCell>{topic.name}</TableCell>
                  <TableCell> <Checkbox checked={topic.theory} /> </TableCell>
                  <TableCell> <Checkbox checked={topic.inTextQuestions} /> </TableCell>
                  <TableCell> <Checkbox checked={topic.inClassQuestions} /> </TableCell>
                  <TableCell> <Checkbox checked={topic.done} /> </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
