import { motion } from "framer-motion";
import { Camera, Zap, PieChart, History, Target, Users } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "AI Photo Scan",
    description: "Just snap a photo of any meal. Our AI identifies food items and calculates nutrition instantly.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get calories, protein, carbs, and fat breakdown in under 3 seconds. No manual entry needed.",
    color: "bg-carbs/10 text-carbs",
  },
  {
    icon: PieChart,
    title: "Detailed Macros",
    description: "Track all your macronutrients with beautiful charts and daily/weekly progress reports.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: History,
    title: "Meal History",
    description: "All your scanned meals are saved. Review your eating patterns and make better choices.",
    color: "bg-fat/10 text-fat",
  },
  {
    icon: Target,
    title: "Custom Goals",
    description: "Set personalized calorie and macro goals based on your fitness objectives.",
    color: "bg-protein/10 text-protein",
  },
  {
    icon: Users,
    title: "Coach Sharing",
    description: "Share your nutrition data with your trainer or nutritionist for professional guidance.",
    color: "bg-success/10 text-success",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Powerful Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Track Nutrition</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple tools powered by advanced AI to make healthy eating effortless for everyone.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl bg-card border hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold font-display mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;