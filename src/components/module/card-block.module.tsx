'use client';

import { cn } from "@/lib/utils";


export interface ICardBlockUI {
  label: string;
  value: string;
  subtext?: string;
  animate?: boolean;
  className?: string;
}

export enum cardBlockUIOrientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal'

}


export const CardBlockUI = ({
  className,
  cardBlockUIContentList,
  orientation = cardBlockUIOrientation.Horizontal
}: {
  className?: string;
  cardBlockUIContentList: ICardBlockUI[];
  orientation?: cardBlockUIOrientation;
}) => {
  const getGridCols = () => {
    if (orientation == cardBlockUIOrientation.Horizontal) {
      if (cardBlockUIContentList.length === 1) {
        return "grid-cols-1"
      }
      if (cardBlockUIContentList.length === 2) {
        return "grid-cols-2"
      }
      if (cardBlockUIContentList.length === 3) {
        return "grid-cols-3"
      }
      if (cardBlockUIContentList.length >= 4) {
        return "grid-cols-2 lg:grid-cols-4"
      }
    }
    if (orientation == cardBlockUIOrientation.Vertical) {
      return "grid-cols-1"
    }
  }
  return (
    <div className={cn(className, 'grid gap-2 lg:gap-4 w-full', getGridCols())}>
      {cardBlockUIContentList.map((block, idx) => (
        <div
          key={`countdown-block-${idx}`}
          className={cn(
            'group relative isolate flex flex-col items-center justify-center overflow-hidden rounded-full py-1 px-2 text-center border border-primary/30 font-heading w-full',
            block.className
          )}>

          <div className='relative flex flex-col items-center'>
            <span
              className={cn(
                'text-xl font-normal text-foreground md:text-2xl lg:text-3xl transition-transform duration-300 group-hover:scale-105 ',
                block.animate && 'text-primary',
              )}>
              {block.value}
            </span>
            <span className='text-sm font-thin tracking-wider text-muted-foreground uppercase'>
              {block.label}
            </span>
            {block.subtext && (
              <span className='text-xs font-extralight text-muted-foreground/70'>
                {block.subtext}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}