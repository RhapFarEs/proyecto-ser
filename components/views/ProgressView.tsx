"use client";

import { useMemo } from "react";
import Link from "next/link";

import Page from "@/components/ui/Page";
import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import EmptyState from "@/components/ui/EmptyState";
import { Body, Caption } from "@/components/ui/Typography";
import { useAuth } from "@/lib/auth/AuthContext";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { getAllDays } from "@/lib/domain/day/day-storage";
import { getWeeks } from "@/lib/domain/week/week-storage";
import { getHabits } from "@/lib/domain/habit/habit-storage";
import { getLifeDirection } from "@/lib/domain/direction/direction-storage";
import { hasClosingReflection } from "@/lib/domain/day/day-reflection";
import { getJournalNotesForDay } from "@/lib/domain/day/day-journal";
import type { Day } from "@/lib/domain/day/day";
import type { Habit } from "@/lib/domain/habit/habit";
import type { Week } from "@/lib/domain/week/week";
import {
  addDaysToKey,
  formatDateKeyLabel,
  formatDateKeyLongLabel,
} from "@/lib/date";

/**
 * How many days-with-presence the path shows. A window, not a metric:
 * enough to feel like a journey, small enough to never become an archive
 * to scroll through anxiously.
 */
const MAX_PATH_DAYS = 30;

type PathDay = {
  day: Day;
  wroteJournal: boolean;
  hadIntention: boolean;
  closedDay: boolean;
  sustained: string[];
};

/**
 * A day belongs to the path if the person was present in it in any way —
 * a note, an intention, a closing reflection, or a sustained practice.
 * Days with nothing are simply absent, never shown as gaps or failures
 * (LANGUAGE_GUIDE.md: absence is silence, never a marked failure).
 */
function buildPathDays(days: Day[], habits: Habit[]): PathDay[] {
  const habitById = new Map(habits.map((habit) => [habit.id, habit]));

  return days
    .map((day) => {
      const sustained: string[] = [];

      for (const entry of day.entries) {
        if (entry.type === "habit" && entry.completed) {
          const habit = habitById.get(entry.habitId);
          if (habit) {
            sustained.push(habit.title);
          }
        }
      }

      return {
        day,
        wroteJournal: getJournalNotesForDay(day).length > 0,
        hadIntention: day.intention.trim().length > 0,
        closedDay: hasClosingReflection(day),
        sustained,
      };
    })
    .filter(
      (item) =>
        item.wroteJournal || item.hadIntention || item.closedDay || item.sustained.length > 0,
    )
    .sort((left, right) => right.day.date.localeCompare(left.day.date))
    .slice(0, MAX_PATH_DAYS);
}

function hasReflectionContent(week: Week): boolean {
  const { wentWell, difficult, nextWeekFocus } = week.reflection;
  return [wentWell, difficult, nextWeekFocus].some((field) => field.trim().length > 0);
}

export default function ProgressView() {
  const { profile } = useAuth();
  const hydrated = useHydrated();

  const direction = hydrated ? getLifeDirection() : null;
  const statement = direction?.statement.trim() ?? "";

  const pathDays = useMemo(
    () => (hydrated ? buildPathDays(getAllDays(), getHabits()) : []),
    [hydrated],
  );

  const reflectedWeeks = useMemo(
    () =>
      hydrated
        ? getWeeks()
            .filter(hasReflectionContent)
            .sort((left, right) => right.id.localeCompare(left.id))
        : [],
    [hydrated],
  );

  return (
    <Page title="Progreso" subtitle="Una mirada calmada a tu camino.">
      {profile ? (
        <Caption>
          Comenzaste este camino el {formatDateKeyLongLabel(profile.startedAt)}.
        </Caption>
      ) : null}

      <Section>
        <div className="space-y-3">
          <SectionTitle>Dirección personal</SectionTitle>

          {statement ? (
            <Card className="space-y-3">
              <Body className="text-zinc-200">{statement}</Body>
              <Link href="/direction" className="inline-block w-fit">
                <Caption className="underline-offset-4 hover:text-zinc-300 hover:underline">
                  Revisar tu dirección
                </Caption>
              </Link>
            </Card>
          ) : (
            <EmptyState
              title="Aún no has escrito tu dirección personal"
              description="Unas líneas sobre hacia dónde quieres caminar. Puedes escribirlas cuando sientas que es el momento."
              action={
                <Link href="/direction" className="inline-block w-fit">
                  <Caption className="underline-offset-4 hover:text-zinc-300 hover:underline">
                    Ir a Dirección personal
                  </Caption>
                </Link>
              }
            />
          )}
        </div>
      </Section>

      <Section>
        <div className="space-y-3">
          <SectionTitle>Días con presencia</SectionTitle>

          {pathDays.length === 0 ? (
            <EmptyState
              title="Tu camino empieza cuando tú empieces"
              description="Cada día en el que escribas, dejes una intención o sostengas una práctica aparecerá aquí."
            />
          ) : (
            <div className="space-y-2">
              {pathDays.map(({ day, wroteJournal, hadIntention, closedDay, sustained }) => (
                <Card key={day.id} className="space-y-1.5">
                  <Caption>{formatDateKeyLabel(day.date)}</Caption>

                  {hadIntention ? (
                    <Body className="text-zinc-200">Dejaste una intención.</Body>
                  ) : null}

                  {wroteJournal ? (
                    <Body className="text-zinc-200">Escribiste en tu diario.</Body>
                  ) : null}

                  {sustained.length > 0 ? (
                    <Body className="text-zinc-200">Sostuviste: {sustained.join(", ")}.</Body>
                  ) : null}

                  {closedDay ? (
                    <Body className="text-zinc-200">Cerraste el día con una reflexión.</Body>
                  ) : null}
                </Card>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section>
        <div className="space-y-3">
          <SectionTitle>Reflexiones semanales</SectionTitle>

          {reflectedWeeks.length === 0 ? (
            <EmptyState
              title="Aún no hay reflexiones semanales"
              description="Cuando cierres una semana con calma, tu reflexión quedará guardada aquí."
              action={
                <Link href="/weekly-review" className="inline-block w-fit">
                  <Caption className="underline-offset-4 hover:text-zinc-300 hover:underline">
                    Ir a Revisión semanal
                  </Caption>
                </Link>
              }
            />
          ) : (
            <div className="space-y-2">
              {reflectedWeeks.map((week) => {
                const rangeLabel = `${formatDateKeyLabel(week.id)} – ${formatDateKeyLabel(
                  addDaysToKey(week.id, 6),
                )}`;

                return (
                  <Card key={week.id} className="space-y-2">
                    <Caption>{rangeLabel}</Caption>

                    {week.reflection.wentWell.trim() ? (
                      <div className="space-y-0.5">
                        <Caption className="text-zinc-500">Qué estuvo bien</Caption>
                        <Body className="text-zinc-200">{week.reflection.wentWell.trim()}</Body>
                      </div>
                    ) : null}

                    {week.reflection.difficult.trim() ? (
                      <div className="space-y-0.5">
                        <Caption className="text-zinc-500">Qué fue difícil</Caption>
                        <Body className="text-zinc-200">{week.reflection.difficult.trim()}</Body>
                      </div>
                    ) : null}

                    {week.reflection.nextWeekFocus.trim() ? (
                      <div className="space-y-0.5">
                        <Caption className="text-zinc-500">Hacia la siguiente semana</Caption>
                        <Body className="text-zinc-200">
                          {week.reflection.nextWeekFocus.trim()}
                        </Body>
                      </div>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Section>
    </Page>
  );
}
