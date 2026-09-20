import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

import { cn } from "@/utils/cn";

export const Collapsible = (props: CollapsiblePrimitive.Root.Props) => {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
};

export const CollapsibleTrigger = (props: CollapsiblePrimitive.Trigger.Props) => {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />;
};

/**
 * Mirrors {@link AccordionContent}: the height transition runs against the panel height Base UI
 * measures into `--collapsible-panel-height`, so animation classes stay on the panel and box
 * classes go on the inner div. The `[hidden]` guard is what lets a caller give the inner div a
 * `display` of its own without defeating the attribute Base UI uses to hide a closed panel.
 */
export const CollapsibleContent = ({
  className,
  children,
  ...props
}: CollapsiblePrimitive.Panel.Props) => {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none [&[hidden]:not([hidden='until-found'])]:hidden"
      {...props}>
      <div className={cn(className)}>{children}</div>
    </CollapsiblePrimitive.Panel>
  );
};
