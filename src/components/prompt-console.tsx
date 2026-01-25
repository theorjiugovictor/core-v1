'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Bot, Command, Loader2, Sparkles, Terminal } from 'lucide-react';

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
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

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
                          className="pl-9 pr-12 h-11 font-mono text-sm bg-muted/50 border-input focus-visible:ring-1 focus-visible:ring-primary"
                          disabled={isPending}
                          autoComplete="off"
                        />
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
            <div className="w-full flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
              <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-3 w-3 text-green-600" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-sm font-medium truncate">{result.message || "Command executed successfully"}</p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{result.action}</p>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
