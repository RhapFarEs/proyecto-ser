import type { Today } from "@/lib/models/Today";

type GreetingSectionProps = {
  today: Today;
};

export default function GreetingSection({
  today,
}: GreetingSectionProps) {
  return (
    <header>
      <h1 className="text-5xl font-light tracking-tight text-zinc-50">
        {today.greeting}, Jacobo
      </h1>

      <p className="mt-3 text-base capitalize text-zinc-500">
        {today.date}
      </p>

      <p className="mt-2 text-sm uppercase tracking-[0.2em] text-zinc-600">
  Semana {today.progress.week} · Día {today.progress.day}
</p>
    </header>
  );
}