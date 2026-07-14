import { Body, Caption } from "./Typography";

type ModuleHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function ModuleHeader({ title, subtitle }: ModuleHeaderProps) {
  return (
    <div className="space-y-1">
      <Body className="text-zinc-100">{title}</Body>
      {subtitle ? <Caption>{subtitle}</Caption> : null}
    </div>
  );
}
