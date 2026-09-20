import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/utils/cn";

export const Accordion = ({ className, ...props }: AccordionPrimitive.Root.Props) => {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
};

export const AccordionItem = ({ className, ...props }: AccordionPrimitive.Item.Props) => {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b", className)}
      {...props}
    />
  );
};

export const AccordionTrigger = ({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between gap-3 rounded-md border border-transparent py-4 text-left text-sm font-medium outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
          className,
        )}
        {...props}>
        {children}
        <ChevronDownIcon
          aria-hidden="true"
          className="mt-0.5 ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-data-panel-open/accordion-trigger:rotate-180 motion-reduce:transition-none"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
};

/**
 * Base UI drives the panel with a height transition against `--accordion-panel-height`, which it
 * measures for us. Keep every animation class on the panel and every box class on the inner div:
 * padding on the panel itself would stop it collapsing to zero. Do not add an `animate-*` class
 * here — Base UI warns when it detects a CSS transition and a CSS animation on the same panel.
 */
export const AccordionContent = ({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) => {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      {...props}>
      <div
        className={cn(
          "pb-4 text-sm [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
          className,
        )}>
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
};
