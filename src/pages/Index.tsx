import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FoodScanner from "@/components/FoodScanner";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import DailyProgress from "@/components/DailyProgress";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        {user && <DailyProgress />}
        <FoodScanner />
        <Features />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
