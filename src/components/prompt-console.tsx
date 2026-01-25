'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Bot, Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getParsedCommand } from '@/lib/actions';
// Bedrock command parser response type
export type ParseBusinessCommandOutput = {
  action: string;
  item?: string;
  quantity?: number;
  price?: number;
  customer?: string;
  isCredit?: boolean;
  date?: string;
};

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Please enter a command, e.g., "Sold 2 bags of rice for ₦80,000 each"',
  }),
});

export function PromptConsole() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ParseBusinessCommandOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setResult(null);
    setError(null);
    startTransition(async () => {
      const response = await getParsedCommand({ input: values.prompt });
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error || 'An unknown error occurred.');
      }
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
            <Sparkles className="w-6 h-6 text-primary" />
            Prompt Console
        </CardTitle>
        <CardDescription>
          Your business, under control. Use natural language to manage your operations.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="e.g., Add 10 cartons of Milo at ₦2,000 each"
                        {...field}
                        className="pr-12"
                        disabled={isPending}
                      />
                      <Button
                        size="icon"
                        type="submit"
                        className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8"
                        disabled={isPending}
                      >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ArrowRight className="h-4 w-4" />
                        )}
                        <span className="sr-only">Submit</span>
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
      {(isPending || result || error) && (
        <CardFooter>
            <div className="text-sm text-muted-foreground w-full flex items-center gap-2 font-code">
                <Bot className="w-4 h-4 shrink-0" />
                <span>
                    {isPending && 'Thinking...'}
                    {error && `Error: ${error}`}
                    {result && `Parsed: ${result.action} - ${result.item || ''} (Qty: ${result.quantity || 'N/A'}, Price: ${result.price || 'N/A'})`}
                </span>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
