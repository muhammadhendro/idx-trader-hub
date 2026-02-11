import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StockDetail from "./pages/StockDetail";
import Screener from "./pages/Screener";
import Journal from "./pages/Journal";
import News from "./pages/News";
import BidOffer from "./pages/BidOffer";
import Alerts from "./pages/Alerts";
import Risk from "./pages/Risk";
import Auth from "./pages/Auth";
import IdxDataHub from "./pages/IdxDataHub";
import BrokerHub from "./pages/BrokerHub";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/stock/:ticker" element={<Layout><StockDetail /></Layout>} />
          <Route path="/screener" element={<Layout><Screener /></Layout>} />
          <Route path="/journal" element={<Layout><Journal /></Layout>} />
          <Route path="/news" element={<Layout><News /></Layout>} />
          <Route path="/bid-offer" element={<Layout><BidOffer /></Layout>} />
          <Route path="/alerts" element={<Layout><Alerts /></Layout>} />
          <Route path="/risk" element={<Layout><Risk /></Layout>} />
          <Route path="/auth" element={<Layout><Auth /></Layout>} />
          <Route path="/idx-data" element={<Layout><IdxDataHub /></Layout>} />
          <Route path="/brokers" element={<Layout><BrokerHub /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
