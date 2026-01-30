'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Bot, Command, Loader2, Sparkles, Terminal, Mic, MicOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { processBusinessCommand } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export type ParseBusinessCommandOutput = {
  action: string;
  item?: string;
  quantity?: number;
  price?: number;
};

const formSchema = z.object({
  prompt: z.string().min(3, {
    message: 'Command too short. Try "Sold 5 bread"',
  }),
});

export function PromptConsole() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          const currentPrompt = form.getValues('prompt');
          // Append if there is text, or replace if empty. 
          // Actually replacing is better for a fresh command usually, but let's append for "adding details" flow.
          // Let's just set it for now for simplicity, or append with space.
          form.setValue('prompt', currentPrompt ? `${currentPrompt} ${transcript}` : transcript);
          setIsListening(false);
          toast({ title: "Heard you!", description: `"${transcript}"` });
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          let errorMessage = "Could not handle voice input.";
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            errorMessage = "Microphone access denied. Please check your browser settings.";
          }
          toast({ title: "Voice Error", description: errorMessage, variant: "destructive" });
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [form, toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({ title: "Not Supported", description: "Your browser does not support voice input.", variant: "destructive" });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({ title: "Listening...", description: "Speak now." });
      } catch (error) {
        // sometimes it fails if already started
        console.error(error);
        setIsListening(false);
      }
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setResult(null);
    startTransition(async () => {
      const response = await processBusinessCommand({ input: values.prompt });

      if (response.success) {
        setResult(response.data);
        toast({
          title: "Command Executed",
          description: response.message,
          className: "bg-green-500 text-white border-none"
        });
        form.reset();
      } else {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <Card className="border shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Terminal className="w-4 h-4 text-primary" />
            Prompt Console
          </CardTitle>
          <CardDescription>
            Record sales, expenses, or check stock using natural language.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="pb-3">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Command className="absolute left-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="e.g., Sold 15 bottles of oil for 800 each"
                          {...field}
                          className="pl-9 pr-24 h-11 font-mono text-sm bg-muted/50 border-input focus-visible:ring-1 focus-visible:ring-primary"
                          disabled={isPending}
                          autoComplete="off"
                        />
                        {/* Microphone Button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={toggleListening}
                          className={cn(
                            "absolute right-10 h-8 w-8 hover:bg-transparent transition-all",
                            isListening ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-primary"
                          )}
                          disabled={isPending}
                          title="Speak Command"
                        >
                          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>

                        <Button
                          size="icon"
                          type="submit"
                          className={cn(
                            "absolute right-1 h-9 w-9 transition-all",
                            isPending ? "bg-muted" : "bg-primary hover:bg-primary/90"
                          )}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <ArrowRight className="h-4 w-4 text-primary-foreground" />
                          )}
                          <span className="sr-only">Execute</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </form>
        </Form>
        {result && (
          <CardFooter className="py-3 bg-muted/30 border-t">
            <div className="w-full flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
              <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-3 w-3 text-green-600" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{result.message || "Command executed successfully"}</p>
                {/* 
                  Since result.data might be an array now (from batch update), we should handle that in display if strictly needed.
                  But the 'message' from actions.ts is a summary string, which is what we display here.
                  The 'result.action' display below might be misleading if it's a batch.
                  Let's check if it's an array and display "BATCH" or the single action.
                 */}
                <div className="flex items-center gap-2">
                  {/* Simplified check: if array length > 1, show BATCH */}
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                    {Array.isArray(result.data) && result.data.length > 1 ? 'BATCH ACTION' : (Array.isArray(result.data) ? result.data[0]?.action : result.action)}
                  </p>
                </div>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
