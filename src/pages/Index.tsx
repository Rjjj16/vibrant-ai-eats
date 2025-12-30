import Header from "@/components/Header";
import FoodScanner from "@/components/FoodScanner";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <FoodScanner />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
