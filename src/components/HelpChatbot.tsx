import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, X } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface HelpChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpChatbot = ({ isOpen, onClose }: HelpChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi! I'm your design assistant. I can help you with using the T-shirt designer, explain features, and answer questions about creating your designs. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Simulate AI response - you can replace this with actual AI API call
      const aiResponse = await generateAIResponse(inputValue);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Sorry, I'm having trouble responding right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const input = userInput.toLowerCase();
    
    // Simple rule-based responses for demo - replace with actual AI API
    if (input.includes("text") || input.includes("font")) {
      return "To add text to your design:\n\n1. Click the 'Add Text' button in the left toolbar\n2. Use the right panel to customize font, size, color, and effects\n3. You can also select existing text on the canvas to edit it\n\nYou can add multiple text elements and each can have different styling!";
    } else if (input.includes("upload") || input.includes("image")) {
      return "To upload your own images:\n\n1. Click the 'Upload Image' button in the left toolbar\n2. Choose your file (PNG, JPEG, SVG, or PDF)\n3. The image will appear on your design\n4. You can resize, rotate, and position it as needed\n\nTip: For best results, use high-resolution images with transparent backgrounds!";
    } else if (input.includes("ai") || input.includes("generate")) {
      return "The AI Art Generator lets you create custom artwork:\n\n1. Click the AI wand button in the left toolbar\n2. Describe what you want in the text prompt\n3. Click 'Generate Image' to create your artwork\n4. The AI will create unique designs based on your description\n\nTry prompts like 'cool dragon illustration' or 'vintage sunset design'!";
    } else if (input.includes("color") || input.includes("product")) {
      return "To change products and colors:\n\n1. Use the top controls to switch between different shirt styles\n2. Pick from various colors in the color picker\n3. You can see how your design looks on different colored shirts\n4. Switch between front and back views\n\nEach product has different available colors and fits!";
    } else if (input.includes("save") || input.includes("download")) {
      return "To save your design:\n\n1. Click the 'Next Step' button when you're happy with your design\n2. Choose your quantity and sizing options\n3. You can save your design and come back to it later\n\nYour designs are automatically saved as you work!";
    } else if (input.includes("reset") || input.includes("clear")) {
      return "To reset your design:\n\n1. Click the reset button (circular arrow) in the left toolbar\n2. This will remove all text and uploaded images\n3. The product itself (t-shirt) will remain\n\nDon't worry - you can always undo if you reset by mistake!";
    } else {
      return "I'm here to help with the T-shirt designer! I can assist with:\n\n• Adding and customizing text\n• Uploading and positioning images\n• Using the AI art generator\n• Changing products and colors\n• Saving your designs\n• General design tips\n\nWhat specific feature would you like help with?";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <DialogTitle>Design Assistant</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about designing..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};