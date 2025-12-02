"use client";

import * as React from "react";
import { format, isSameDay, isToday, isBefore } from "date-fns";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  Bell,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ----------------------
// SUPABASE CLIENT (HARDCODED)
// ----------------------
const supabase = createClient(
  "https://jrgxheckjteefpavbhlm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ3hoZWNranRlZWZwYXZiaGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNzUzMjUsImV4cCI6MjA2MTY1MTMyNX0.IgwV1vyiZRZqt8nl9WAcijI0AMSeoGqPf72go-OIwtM"
);

// ----------------------
// TYPES
// ----------------------
type Reminder = {
  id: string;
  date: Date;
  text: string;
};

// ----------------------
// LOCAL DATE FORMAT FIX (IMPORTANT)
// ----------------------
function formatLocalDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ----------------------
// COMPONENT
// ----------------------
export default function CalendarCard() {
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );
  const [newReminderText, setNewReminderText] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  // ----------------------
  // FETCH + REALTIME
  // ----------------------
  const fetchReminders = React.useCallback(async () => {
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .order("date", { ascending: true });

    if (!error && data) {
      setReminders(
        data.map((r: any) => ({
          id: String(r.id),
          date: new Date(r.date + "T12:00:00"),
          text: r.text,
        }))
      );
    }
  }, []);

  React.useEffect(() => {
    fetchReminders();

    const channel = supabase
      .channel("realtime-reminders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reminders" },
        () => fetchReminders()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchReminders]);

  // ----------------------
  // ADD REMINDER (FIXED)
  // ----------------------
  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim() || !selectedDate) return;

    const savedDate = formatLocalDate(selectedDate);

    console.log("Selected date:", selectedDate);
    console.log("Saved as:", savedDate);

    await supabase.from("reminders").insert({
      text: newReminderText.trim(),
      date: savedDate, // ⭐ FIXED — NO TIMEZONE SHIFT
    });

    setNewReminderText("");
  };

  // ----------------------
  // DELETE REMINDER
  // ----------------------
  const handleRemoveReminder = async (id: string) => {
    await supabase.from("reminders").delete().eq("id", id);
  };

  // ----------------------
  // UPDATE REMINDER (inline)
  // ----------------------
  const handleSaveEdit = async (id: string) => {
    if (!editingText.trim()) return;
    await supabase
      .from("reminders")
      .update({ text: editingText.trim() })
      .eq("id", id);
    setEditingId(null);
    setEditingText("");
  };

  // ----------------------
  // COLOR DOTS
  // ----------------------
  const getColorDot = (date: Date) => {
    if (isToday(date)) return "🟠";
    if (isBefore(date, new Date()) && !isToday(date)) return "🔴";
    return "🔵";
  };

  // ----------------------
  // DRAG HANDLERS
  // ----------------------
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  };

  const onDragEnd = () => setDraggingId(null);

  const tryParseDate = (s: string | null): Date | null => {
    if (!s) return null;
    const parsed = Date.parse(s);
    if (!isNaN(parsed)) return new Date(parsed);
    const iso = s.trim().match(/\d{4}-\d{2}-\d{2}/);
    if (iso) return new Date(iso[0]);
    return null;
  };

  const detectCalendarDate = (e: React.DragEvent): Date | null => {
    const x = e.clientX;
    const y = e.clientY;
    const elements = document.elementsFromPoint(x, y) as HTMLElement[];

    for (const el of elements) {
      const isoAttr = el.getAttribute("data-date");
      if (isoAttr) {
        const parsed = tryParseDate(isoAttr);
        if (parsed) return parsed;
      }

      const role = el.getAttribute("role");
      const text = (el.textContent || "").trim();

      if (
        (role === "gridcell" || el.tagName === "BUTTON") &&
        /^\d{1,2}$/.test(text)
      ) {
        const day = text;

        const caption = document.querySelector<HTMLElement>(
          "[aria-live][role='presentation']"
        );
        if (caption && /\w+\s+\d{4}/.test(caption.textContent!.trim())) {
          const candidate = `${day} ${caption.textContent!.trim()}`;
          const parsed = tryParseDate(candidate);
          if (parsed) return parsed;
        }
      }

      const parsedDirect = tryParseDate(text);
      if (parsedDirect) return parsedDirect;
    }

    return null;
  };

  const onCalendarDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    if (!id) return;

    const date = detectCalendarDate(e);
    if (!date) {
      alert("Couldn't detect calendar date.");
      return;
    }

    const saved = formatLocalDate(date);

    await supabase.from("reminders").update({ date: saved }).eq("id", id);
  };

  const onCalendarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // ----------------------
  // FILTERS
  // ----------------------
  const todaysReminders = reminders.filter((r) =>
    isSameDay(r.date, new Date())
  );
  const selectedDateReminders = selectedDate
    ? reminders.filter((r) => isSameDay(r.date, selectedDate))
    : [];

  // ----------------------
  // RENDER
  // ----------------------
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Schedule
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground group-hover:scale-125 transition-transform" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(), "PPP")}
            </div>
            <div className="mt-2 space-y-1">
              {todaysReminders.length > 0 ? (
                todaysReminders.slice(0, 2).map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <Bell className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">
                      {getColorDot(r.date)} {r.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No reminders for today.
                </p>
              )}

              {todaysReminders.length > 2 && (
                <p className="text-xs text-muted-foreground pl-5 font-bold">
                  ...and {todaysReminders.length - 2} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Calendar & Reminders</DialogTitle>
          <DialogDescription>
            Drag a reminder onto a calendar day to move it.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Calendar */}
          <div
            className="flex justify-center"
            onDrop={onCalendarDrop}
            onDragOver={onCalendarDragOver}
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => {
                if (!d) return;
                const fixed = new Date(
                  d.getFullYear(),
                  d.getMonth(),
                  d.getDate()
                );
                setSelectedDate(fixed);
              }}
              className="rounded-md border"
              modifiers={{ hasReminder: reminders.map((r) => r.date) }}
              modifiersClassNames={{
                hasReminder:
                  "relative !bg-primary/70 !text-primary-foreground rounded-full",
              }}
            />
          </div>

          {/* Reminders List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Reminders for {selectedDate ? format(selectedDate, "PPP") : "..."}
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {selectedDateReminders.length ? (
                selectedDateReminders.map((r) => (
                  <div
                    key={r.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, r.id)}
                    onDragEnd={onDragEnd}
                    className={`flex items-center justify-between p-2 bg-muted rounded-md group ${
                      draggingId === r.id ? "opacity-60" : ""
                    }`}
                  >
                    {editingId === r.id ? (
                      <Input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                      />
                    ) : (
                      <p className="text-sm">
                        {getColorDot(r.date)} {r.text}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {editingId === r.id ? (
                        <Button
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleSaveEdit(r.id)}
                        >
                          ✔️
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => {
                            setEditingId(r.id);
                            setEditingText(r.text);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => handleRemoveReminder(r.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground italic py-4">
                  No reminders for this day.
                </p>
              )}
            </div>

            {/* Add input */}
            <form
              onSubmit={handleAddReminder}
              className="flex items-center gap-2 border-t pt-4"
            >
              <Input
                placeholder="Add a new reminder..."
                value={newReminderText}
                onChange={(e) => setNewReminderText(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newReminderText.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            <p className="text-xs text-muted-foreground italic">
              Tip: Drop directly onto a calendar day.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
