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
  intention: string;
  wroteJournal: boolean;
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
        // The person's own words, not the fact that words existed — a list
        // that only says "dejaste una intención" is a log of events, and
        // three hundred of those look identical after a year.
        intention: day.intention.trim(),
        wroteJournal: getJournalNotesForDay(day).length > 0,
        closedDay: hasClosingReflection(day),
        sustained,
      };
    })
    .filter(
      (item) =>
        item.wroteJournal || item.intention || item.closedDay || item.sustained.length > 0,
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
    <Page title="Tu camino" subtitle="Lo que has vivido, en tus propias palabras.">
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
              <Body className="ser-voice text-lg leading-[1.65] text-ink">
                {statement}
              </Body>
              <Link href="/direction" className="inline-block w-fit">
                <Caption className="underline-offset-4 hover:text-ink-soft hover:underline">
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
                  <Caption className="underline-offset-4 hover:text-ink-soft hover:underline">
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
              {pathDays.map(({ day, intention, wroteJournal, closedDay, sustained }) => (
                <Card key={day.id} className="space-y-2">
                  <Caption>{formatDateKeyLabel(day.date)}</Caption>

                  {/*
                    The intention leads and is quoted verbatim: it is the
                    most personal thing the person made that day, and
                    reading it back months later is the whole reason this
                    screen is worth opening.
                  */}
                  {/* Their words, so: serif. */}
                  {intention ? (
                    <Body className="ser-voice text-lg leading-[1.6] text-ink">
                      “{intention}”
                    </Body>
                  ) : null}

                  {sustained.length > 0 ? (
                    <Caption>Sostuviste: {sustained.join(", ")}.</Caption>
                  ) : null}

                  {wroteJournal ? <Caption>Escribiste en tu diario.</Caption> : null}

                  {closedDay ? <Caption>Cerraste el día con una reflexión.</Caption> : null}
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
                  <Caption className="underline-offset-4 hover:text-ink-soft hover:underline">
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
                        <Caption className="text-ink-faint">Qué estuvo bien</Caption>
                        <Body className="ser-voice text-ink">{week.reflection.wentWell.trim()}</Body>
                      </div>
                    ) : null}

                    {week.reflection.difficult.trim() ? (
                      <div className="space-y-0.5">
                        <Caption className="text-ink-faint">Qué fue difícil</Caption>
                        <Body className="ser-voice text-ink">{week.reflection.difficult.trim()}</Body>
                      </div>
                    ) : null}

                    {week.reflection.nextWeekFocus.trim() ? (
                      <div className="space-y-0.5">
                        <Caption className="text-ink-faint">Hacia la siguiente semana</Caption>
                        <Body className="ser-voice text-ink">
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
