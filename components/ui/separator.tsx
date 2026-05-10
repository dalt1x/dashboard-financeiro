import * as SeparatorPrimitive from "@radix-ui/react-separator";

export function Separator(props: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      className="bg-[var(--color-border)] data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full"
      {...props}
    />
  );
}
