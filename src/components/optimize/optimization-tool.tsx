"use client"

import * as React from "react"
import { useFormState } from "react-dom"
import { summarizeFleetActivity, SummarizeFleetActivityOutput } from "@/ai/flows/summarize-fleet-activity"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Wand2, Bot, Route, Lightbulb, Loader2 } from "lucide-react"

type State = {
  result: SummarizeFleetActivityOutput | null
  error: string | null
}

const initialState: State = {
  result: null,
  error: null,
}

export default function OptimizationTool() {
  const [state, formAction] = useFormState(async (prevState: State, formData: FormData): Promise<State> => {
    try {
      const dailyEvents = formData.get("dailyEvents") as string
      if (!dailyEvents) {
        return { result: null, error: "Daily events report cannot be empty." }
      }
      const result = await summarizeFleetActivity({ dailyEvents })
      return { result, error: null }
    } catch (e: any) {
      return { result: null, error: e.message || "An unknown error occurred." }
    }
  }, initialState)

  // Use a ref to access the form element and track its pending state.
  const formRef = React.useRef<HTMLFormElement>(null)
  const [isPending, setIsPending] = React.useState(false)

  React.useEffect(() => {
    const form = formRef.current
    if (!form) return

    const handleFormMutation = () => {
        // This is a bit of a hack to get pending status from a form action
        // A more robust solution might use a library or a different pattern
        // if form has a FormData event, it's submitting
        const isSubmitting = form.hasAttribute('data-submitting')
        setIsPending(isSubmitting)
    }

    const observer = new MutationObserver(handleFormMutation);
    observer.observe(form, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.currentTarget.setAttribute('data-submitting', 'true');
    formAction(new FormData(event.currentTarget));
    // The attribute is removed by the observer when the submission is done.
    // We can reset it here as a fallback
    setTimeout(() => event.currentTarget.removeAttribute('data-submitting'), 200) 
  }


  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Fleet Activity Summarizer</CardTitle>
          <CardDescription>
            Input the daily fleet activity report to get an AI-powered summary and optimization recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dailyEvents">Daily Activity Report</Label>
              <Textarea
                id="dailyEvents"
                name="dailyEvents"
                placeholder="Paste the detailed report of the day's fleet activities, including notable events, delays, resource utilization, etc."
                className="min-h-[200px]"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Optimization
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>AI Analysis & Recommendations</CardTitle>
          <CardDescription>
            The generated summary and recommendations will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center space-y-4">
          {isPending && (
            <div className="text-center text-muted-foreground animate-pulse">
                <Loader2 className="h-12 w-12 mx-auto animate-spin" />
                <p className="mt-4 font-medium">Analyzing data...</p>
                <p className="text-sm">Our AI is processing the report.</p>
            </div>
          )}

          {!isPending && state.error && (
            <div className="text-center text-destructive">
              <p className="font-semibold">Error</p>
              <p>{state.error}</p>
            </div>
          )}

          {!isPending && !state.result && !state.error && (
             <div className="text-center text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto" />
                <p className="mt-4 font-medium">Awaiting Input</p>
                <p className="text-sm">Results will be shown here after generation.</p>
            </div>
          )}

          {!isPending && state.result && (
            <div className="w-full space-y-6 text-sm">
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-accent"/> Summary</h3>
                    <p className="text-muted-foreground bg-secondary p-3 rounded-md">{state.result.summary}</p>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Route className="h-5 w-5 text-accent"/> Recommendations</h3>
                    <p className="text-muted-foreground bg-secondary p-3 rounded-md">{state.result.recommendations}</p>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
