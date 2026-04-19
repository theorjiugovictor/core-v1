'use client';

import Link from 'next/link';
import { useState, useTransition, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowRight, Loader2, Mic, MicOff, HelpCircle,
  ShoppingCart, TrendingDown, Package, Boxes, Search,
  AlertCircle, CheckCircle2, Sparkles, Bot,
} from 'lucide-react';

type CommandResponse = { success: true; message: string; data: any[] } | { success: false; error: string };

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { processBusinessCommand } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ActivityEntry {
  id: string;
  command: string;
  message: string;
  action: string;
  success: boolean;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// These actions render as chat bubbles instead of activity cards
const CHAT_ACTIONS = new Set(['CHAT', 'CLARIFY']);

const formSchema = z.object({
  prompt: z.string().min(1, { message: 'Say something.' }),
});

const SUGGESTIONS = [
  'Sold 5 bags of rice at 28k',
  'Spent 5000 on fuel',
  'How are my margins looking?',
  'What should I restock first?',
];

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; border: string; bg: string; label: string }> = {
  SALE:           { icon: ShoppingCart,  color: 'text-emerald-600 dark:text-emerald-400', border: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30',  label: 'Sale' },
  EXPENSE:        { icon: TrendingDown,  color: 'text-orange-600 dark:text-orange-400',   border: 'border-l-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30',    label: 'Expense' },
  STOCK_IN:       { icon: Package,       color: 'text-blue-600 dark:text-blue-400',       border: 'border-l-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/30',        label: 'Restocked' },
  STOCK_REMOVE:   { icon: Package,       color: 'text-red-600 dark:text-red-400',         border: 'border-l-red-500',    bg: 'bg-red-50 dark:bg-red-950/30',          label: 'Stock Out' },
  STOCK_SET:      { icon: Package,       color: 'text-blue-600 dark:text-blue-400',       border: 'border-l-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/30',        label: 'Stock Set' },
  STOCK_CHECK:    { icon: Search,        color: 'text-slate-600 dark:text-slate-400',     border: 'border-l-slate-400',  bg: 'bg-slate-50 dark:bg-slate-900/30',      label: 'Stock Check' },
  LIST_INVENTORY: { icon: Boxes,         color: 'text-slate-600 dark:text-slate-400',     border: 'border-l-slate-400',  bg: 'bg-slate-50 dark:bg-slate-900/30',      label: 'Inventory' },
  LOW_STOCK:      { icon: AlertCircle,   color: 'text-amber-600 dark:text-amber-400',     border: 'border-l-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950/30',      label: 'Low Stock' },
  CREATE_PRODUCT: { icon: Sparkles,      color: 'text-violet-600 dark:text-violet-400',   border: 'border-l-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30',    label: 'Created' },
  UPDATE_PRODUCT: { icon: Package,       color: 'text-violet-600 dark:text-violet-400',   border: 'border-l-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30',    label: 'Updated' },
  DELETE_PRODUCT: { icon: Package,       color: 'text-red-600 dark:text-red-400',         border: 'border-l-red-500',    bg: 'bg-red-50 dark:bg-red-950/30',          label: 'Deleted' },
  PROFIT_QUERY:   { icon: TrendingDown,  color: 'text-indigo-600 dark:text-indigo-400',   border: 'border-l-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30',    label: 'Profit' },
  BATCH:          { icon: CheckCircle2,  color: 'text-emerald-600 dark:text-emerald-400', border: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', label: 'Batch' },
  ERROR:          { icon: AlertCircle,   color: 'text-red-600 dark:text-red-400',         border: 'border-l-red-400',    bg: 'bg-red-50 dark:bg-red-950/30',          label: 'Error' },
};

const CoreAvatar = ({ className }: { className?: string }) => (
  <div className={cn(
    'w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm',
    className
  )}>
    <Bot className="w-3.5 h-3.5 text-white" />
  </div>
);

/** Chat bubble — used for CHAT and CLARIFY responses */
function ChatBubble({ entry }: { entry: ActivityEntry }) {
  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
      {/* User message — right aligned */}
      <div className="flex justify-end">
        <div className="max-w-[78%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm leading-relaxed">{entry.command}</p>
        </div>
      </div>

      {/* CORE response — left aligned with avatar */}
      <div className="flex items-start gap-2.5">
        <CoreAvatar className="mt-0.5" />
        <div className="max-w-[78%] bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.message}</p>
        </div>
      </div>
    </div>
  );
}

/** Activity card — used for all operational commands (SALE, STOCK, EXPENSE, etc.) */
function ActivityCard({ entry }: { entry: ActivityEntry }) {
  const config = ACTION_CONFIG[entry.action] ?? ACTION_CONFIG.ERROR;
  const Icon = config.icon;

  return (
    <div className={cn(
      'border-l-4 rounded-r-lg px-3 py-2.5 animate-in fade-in slide-in-from-bottom-1 duration-200',
      config.border,
      config.bg,
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <Icon className={cn('w-3.5 h-3.5 shrink-0 mt-[3px]', config.color)} />
          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] text-muted-foreground font-mono truncate leading-none">
              {entry.command}
            </p>
            <p className="text-sm leading-snug whitespace-pre-wrap break-words">
              {entry.message}
            </p>
          </div>
        </div>
        <span className={cn('text-[10px] font-bold uppercase tracking-widest shrink-0 mt-0.5', config.color)}>
          {config.label}
        </span>
      </div>
    </div>
  );
}

/** Typing indicator shown while waiting for a response */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2.5 animate-in fade-in duration-200">
      <CoreAvatar />
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export function PromptConsole() {
  const [isPending, startTransition] = useTransition();
  const [history, setHistory] = useState<ActivityEntry[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: '' },
  });

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [history, isPending]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const current = form.getValues('prompt');
      form.setValue('prompt', current ? `${current} ${transcript}` : transcript);
      setIsListening(false);
      toast({ title: 'Heard you!', description: `"${transcript}"` });
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      const msg = (event.error === 'not-allowed' || event.error === 'service-not-allowed')
        ? 'Microphone access denied. Check your browser settings.'
        : 'Could not handle voice input.';
      toast({ title: 'Voice Error', description: msg, variant: 'destructive' });
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [form, toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({ title: 'Not Supported', description: 'Your browser does not support voice input.', variant: 'destructive' });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({ title: 'Listening...', description: 'Speak now.' });
      } catch {
        setIsListening(false);
      }
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const command = values.prompt.trim();
    form.reset();
    inputRef.current?.focus();

    const historySnapshot = conversationHistory;

    startTransition(async () => {
      const response = await processBusinessCommand({
        input: command,
        conversationHistory: historySnapshot,
      }) as CommandResponse;

      if (response.success) {
        const actions: any[] = Array.isArray(response.data) ? response.data : [];
        let action = 'CHAT';
        if (actions.length > 1) action = 'BATCH';
        else if (actions.length === 1) action = actions[0]?.action ?? 'CHAT';

        const assistantMessage = response.message || 'Done.';

        setHistory(prev => [...prev, {
          id: crypto.randomUUID(),
          command,
          message: assistantMessage,
          action,
          success: true,
        }]);

        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: command },
          { role: 'assistant', content: assistantMessage },
        ]);
      } else {
        const errorMessage = response.error || 'Something went wrong. Try rephrasing.';

        setHistory(prev => [...prev, {
          id: crypto.randomUUID(),
          command,
          message: errorMessage,
          action: 'ERROR',
          success: false,
        }]);

        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: command },
          { role: 'assistant', content: `Error: ${errorMessage}` },
        ]);
      }
    });
  }

  const hasHistory = history.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <Card className="border-primary/20 shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70" />

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2.5 text-xl font-bold">
              <CoreAvatar />
              CORE Assistant
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
              <Link href="/help" title="Help & Commands">
                <HelpCircle className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {!hasHistory && (
            <p className="text-sm text-muted-foreground">
              Log sales, check stock, track expenses — or just ask.
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0 space-y-3">

          {/* Feed */}
          {hasHistory && (
            <div
              ref={feedRef}
              className="space-y-3 max-h-[420px] overflow-y-auto pr-0.5 scroll-smooth"
            >
              {history.map(entry =>
                CHAT_ACTIONS.has(entry.action)
                  ? <ChatBubble key={entry.id} entry={entry} />
                  : <ActivityCard key={entry.id} entry={entry} />
              )}
              {isPending && <TypingIndicator />}
            </div>
          )}

          {/* Suggestion chips — shown before first message */}
          {!hasHistory && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <Badge
                  key={s}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 font-normal px-3 py-1 transition-colors text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    form.setValue('prompt', s);
                    inputRef.current?.focus();
                  }}
                >
                  {s}
                </Badge>
              ))}
            </div>
          )}

          {/* Input bar */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative flex items-center group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                        <div className="relative flex items-center w-full bg-background rounded-md">
                          <Input
                            placeholder={
                              hasHistory
                                ? 'Reply or give a new command...'
                                : 'e.g. "Sold 5 Indomie at 500" or "How are my margins?"'
                            }
                            {...field}
                            ref={(el) => {
                              (field as any).ref(el);
                              (inputRef as any).current = el;
                            }}
                            className="pr-24 h-12 text-sm bg-muted/30 border-input focus-visible:ring-0 focus-visible:border-primary shadow-sm"
                            disabled={isPending}
                            autoComplete="off"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={toggleListening}
                            className={cn(
                              'absolute right-12 h-9 w-9 hover:bg-muted transition-all',
                              isListening
                                ? 'text-red-500 animate-pulse bg-red-100 dark:bg-red-900/20'
                                : 'text-muted-foreground hover:text-primary'
                            )}
                            disabled={isPending}
                            title="Speak"
                          >
                            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="icon"
                            type="submit"
                            className={cn(
                              'absolute right-1.5 h-9 w-9 transition-all shadow-sm',
                              isPending ? 'bg-muted' : 'bg-primary hover:bg-primary/90'
                            )}
                            disabled={isPending}
                          >
                            {isPending
                              ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              : <ArrowRight className="h-4 w-4 text-primary-foreground" />
                            }
                            <span className="sr-only">Send</span>
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
