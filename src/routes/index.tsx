import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { ArrowRight, BookOpen, Key, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="py-16 space-y-20">
      {/* Hero */}
      <section className="text-center max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {env.companyName}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Explore APIs, manage applications, and generate credentials — all in
          one place.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link to="/apis">
              Browse APIs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <FeatureCard
          icon={BookOpen}
          title="API Catalog"
          description="Browse available API products, view OpenAPI specs, and find the right APIs for your application."
        />
        <FeatureCard
          icon={Key}
          title="Self-Service Keys"
          description="Generate API keys and OAuth credentials for your applications with one-click provisioning."
        />
        <FeatureCard
          icon={Users}
          title="Team Management"
          description="Organize developers into teams, manage applications, and control access to API subscriptions."
        />
      </section>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed p-6 space-y-3">
      <div className="rounded-md bg-muted p-2.5 w-fit">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
