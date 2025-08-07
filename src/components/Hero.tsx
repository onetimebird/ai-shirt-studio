import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-design.jpg";
import aiDesigner from "@/assets/ai-designer.png";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="flex justify-center mb-8">
          <img 
            src={aiDesigner} 
            alt="AI Designer" 
            className="w-24 h-24 animate-bounce"
          />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
          Design T-Shirts with AI
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Create unique, personalized t-shirt designs in seconds using the power of artificial intelligence. 
          Just describe your idea, and watch it come to life!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="hero" 
            size="lg"
            className="text-lg px-8 py-6"
            onClick={() => document.getElementById('designer')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Designing
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="text-lg px-8 py-6"
          >
            View Gallery
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-gradient-card rounded-xl p-6 shadow-soft">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Design</h3>
            <p className="text-muted-foreground">Transform your ideas into stunning designs with our advanced AI technology</p>
          </div>
          
          <div className="bg-gradient-card rounded-xl p-6 shadow-soft">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">Get professional-quality designs in seconds, not hours</p>
          </div>
          
          <div className="bg-gradient-card rounded-xl p-6 shadow-soft">
            <div className="text-3xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2">Easy Ordering</h3>
            <p className="text-muted-foreground">Order your custom t-shirt with just a few clicks and fast delivery</p>
          </div>
        </div>
      </div>
    </section>
  );
};