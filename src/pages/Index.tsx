import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Flame, Shield, TrendingUp, Bell } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
      
      <div className="relative">
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <span className="text-2xl font-bold">Fire Defence System</span>
            </div>
            <Button onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Real-Time Fire
                <span className="block text-primary">Monitoring System</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Advanced sensor monitoring and alert management for fire brigades, officers, and local incharges. Stay protected with instant notifications and comprehensive analytics.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg px-8">
                Sign In
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Bell className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Live Alerts</h3>
                <p className="text-muted-foreground">
                  Receive instant notifications when sensors detect anomalies. Real-time updates every 10 seconds.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-accent/20">
                    <Shield className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Multi-Location</h3>
                <p className="text-muted-foreground">
                  Monitor multiple sensor locations simultaneously with an interactive map view and status tracking.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-status-normal/20">
                    <TrendingUp className="h-8 w-8 text-status-normal" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Analytics</h3>
                <p className="text-muted-foreground">
                  Track alert history, analyze trends, and generate reports for better emergency preparedness.
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="container mx-auto px-4 py-8 mt-20 border-t border-border">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Fire Defence System. All rights reserved.</p>
            <p className="mt-2">Professional fire monitoring solution for emergency services</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
