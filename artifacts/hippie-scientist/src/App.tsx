import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Herbs from "@/pages/Herbs";
import HerbDetail from "@/pages/HerbDetail";
import Compounds from "@/pages/Compounds";
import CompoundDetail from "@/pages/CompoundDetail";
import Stacks from "@/pages/Stacks";
import Goals from "@/pages/Goals";
import Learn from "@/pages/Learn";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/herbs" component={Herbs} />
      <Route path="/herbs/:slug" component={HerbDetail} />
      <Route path="/compounds" component={Compounds} />
      <Route path="/compounds/:slug" component={CompoundDetail} />
      <Route path="/stacks" component={Stacks} />
      <Route path="/goals" component={Goals} />
      <Route path="/learn" component={Learn} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
