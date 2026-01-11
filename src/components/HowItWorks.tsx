import { motion } from "framer-motion";
import { Camera, Cpu, BarChart3, Check } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Take a Photo",
    description: "Open the app and snap a picture of your meal. Works with any food - homemade or restaurant.",
    color: "from-primary to-primary/60",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Analyzes",
    description: "Our AI instantly identifies all food items in your photo and calculates nutritional values.",
    color: "from-accent to-accent/60",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Get Results",
    description: "View detailed breakdown of calories, protein, carbs, and fats. Save to your meal log.",
    color: "from-carbs to-carbs/60",
  },
  {
    number: "04",
    icon: Check,
    title: "Track Progress",
    description: "Monitor your daily intake, hit your goals, and build healthier eating habits over time.",
    color: "from-success to-success/60",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            How <span className="gradient-text">AI Food Calorie</span> Works
          </h2>
          <p className="text-lg text-muted-foreground">
            From photo to nutrition facts in seconds. It's that simple.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="relative bg-card rounded-2xl p-6 border hover:shadow-lg transition-all duration-300 group">
                {/* Step number badge */}
                <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>

                <h3 className="text-xl font-bold font-display mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;