import { createFileRoute, Link, useNavigate, useHydrated } from "@tanstack/react-router";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TestReport } from "@/components/test-report";
import { deleteTest, useSettings, useTests } from "@/lib/store";

export const Route = createFileRoute("/history/$id")({
  head: () => ({
    meta: [
      { title: "Test Report — Smart Food Box" },
      { name: "description", content: "Complete freshness test report with sensor timeline and indicator breakdown." },
      { property: "og:title", content: "Test Report — Smart Food Box" },
      { property: "og:description", content: "Experimental freshness estimate and full sensor readings." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { id } = Route.useParams();
  const tests = useTests();
  const settings = useSettings();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const test = tests.find((t) => t.id === id);

  if (!hydrated) return <div className="glass h-96 animate-pulse rounded-[2.5rem]" />;

  if (!test)
    return (
      <div className="glass mx-auto max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-2xl font-semibold">Test not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This report may have been deleted.</p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/history">Back to history</Link>
        </Button>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-fade-up">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
            <Link to="/history">
              <ArrowLeft /> Test history
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold md:text-4xl">{test.dishName}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost">
                <Trash2 /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                <AlertDialogDescription>
                  The test for “{test.dishName}” will be removed from your history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    deleteTest(test.id);
                    toast("Report deleted");
                    navigate({ to: "/history" });
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button asChild variant="hero" className="rounded-xl">
            <Link to="/test/new" search={{ from: test.id }}>
              <RotateCcw /> Retest this dish
            </Link>
          </Button>
        </div>
      </div>
      <TestReport test={test} unit={settings.temperatureUnit} />
    </div>
  );
}
