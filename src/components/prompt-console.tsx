'use client';

import Link from 'next/link';
import { useState, useTransition, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowUp, Loader2, Mic, MicOff,
  ShoppingCart, TrendingDown,
  AlertCircle, BarChart2, PackageSearch,
} from 'lucide-react';

type CommandResponse = { success: true; message: string; data: any[] } | { success: false; error: string };

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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

const formSchema = z.object({
  prompt: z.string().min(1),
});

const ACTION_META: Record<string, { label: string; color: string; bg: string }> = {
  SALE:           { label: 'Sale recorded',    color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
  EXPENSE:        { label: 'Expense logged',   color: 'text-orange-700 dark:text-orange-300',   bg: 'bg-orange-100 dark:bg-orange-900/40' },
  STOCK_IN:       { label: 'Restocked',        color: 'text-blue-700 dark:text-blue-300',       bg: 'bg-blue-100 dark:bg-blue-900/40' },
  STOCK_REMOVE:   { label: 'Stock removed',    color: 'text-red-700 dark:text-red-300',         bg: 'bg-red-100 dark:bg-red-900/40' },
  STOCK_SET:      { label: 'Stock updated',    color: 'text-blue-700 dark:text-blue-300',       bg: 'bg-blue-100 dark:bg-blue-900/40' },
  STOCK_CHECK:    { label: 'Stock check',      color: 'text-slate-600 dark:text-slate-400',     bg: 'bg-slate-100 dark:bg-slate-800/40' },
  LIST_INVENTORY: { label: 'Inventory',        color: 'text-slate-600 dark:text-slate-400',     bg: 'bg-slate-100 dark:bg-slate-800/40' },
  LOW_STOCK:      { label: 'Low stock',        color: 'text-amber-700 dark:text-amber-300',     bg: 'bg-amber-100 dark:bg-amber-900/40' },
  CREATE_PRODUCT: { label: 'Product created',  color: 'text-violet-700 dark:text-violet-300',   bg: 'bg-violet-100 dark:bg-violet-900/40' },
  UPDATE_PRODUCT: { label: 'Product updated',  color: 'text-violet-700 dark:text-violet-300',   bg: 'bg-violet-100 dark:bg-violet-900/40' },
  DELETE_PRODUCT: { label: 'Product deleted',  color: 'text-red-700 dark:text-red-300',         bg: 'bg-red-100 dark:bg-red-900/40' },
  PROFIT_QUERY:   { label: 'Profit',           color: 'text-indigo-700 dark:text-indigo-300',   bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
  BATCH:          { label: 'Batch recorded',   color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
  ERROR:          { label: 'Error',            color: 'text-red-700 dark:text-red-300',         bg: 'bg-red-100 dark:bg-red-900/40' },
};

const CHAT_ACTIONS = new Set(['CHAT', 'CLARIFY']);

const SUGGESTIONS = [
  { icon: ShoppingCart,  text: 'Sold 5 bags of rice at 28k' },
  { icon: TrendingDown,  text: 'Spent ₦5,000 on fuel' },
  { icon: BarChart2,     text: 'How are my margins looking?' },
  { icon: PackageSearch, text: 'Which items are low on stock?' },
];

const CoreAvatar = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => (
  <div className={cn(
    'rounded-full bg-primary flex items-center justify-center shrink-0',
    size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  )}>
    <span className={cn('text-primary-foreground font-bold leading-none tracking-tight', size === 'sm' ? 'text-xs' : 'text-sm')}>C</span>
  </div>
);

function MessageBubble({ entry }: { entry: ActivityEntry }) {
  const isChat = CHAT_ACTIONS.has(entry.action);
  const meta = !isChat ? (ACTION_META[entry.action] ?? ACTION_META.ERROR) : null;

  return (
    <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* User message */}
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm leading-relaxed">{entry.command}</p>
        </div>
      </div>

      {/* Assistant response */}
      <div className="flex items-end gap-2">
        <CoreAvatar size="sm" />
        <div className={cn(
          'max-w-[75%] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm',
          entry.success
            ? 'bg-card border border-border/50'
            : 'bg-destructive/10 border border-destructive/20'
        )}>
          {meta && (
            <span className={cn(
              'inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2',
              meta.color, meta.bg
            )}>
              {meta.label}
            </span>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {entry.message}
          </p>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-in fade-in duration-200">
      <CoreAvatar size="sm" />
      <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
        </div>
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
      <div className="rounded-2xl border border-border bg-background shadow-md overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-muted/30">
          <CoreAvatar size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-none">CORE Assistant</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPending ? 'Thinking…' : 'Online'}
            </p>
          </div>
          <div className={cn(
            'w-2 h-2 rounded-full',
            isPending ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
          )} />
        </div>

        {/* Message feed */}
        <div className="flex-1 flex flex-col">
          {!hasHistory ? (
            /* Empty state */
            <div className="px-4 pt-6 pb-4 space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">What can I help with?</p>
                <p className="text-xs text-muted-foreground">Record transactions, check stock, or just ask.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.map(({ icon: Icon, text }) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => {
                      form.setValue('prompt', text);
                      inputRef.current?.focus();
                    }}
                    className="flex items-center gap-2.5 text-left px-3 py-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all group"
                  >
                    <Icon className="w-4 h-4 text-primary/70 shrink-0 group-hover:text-primary transition-colors" />
                    <span className="text-xs text-foreground/80 group-hover:text-foreground font-medium leading-snug transition-colors">{text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              ref={feedRef}
              className="px-4 py-4 space-y-4 max-h-[420px] overflow-y-auto scroll-smooth"
            >
              {history.map(entry => (
                <MessageBubble key={entry.id} entry={entry} />
              ))}
              {isPending && <TypingIndicator />}
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-3 py-3 border-t border-border/50 bg-muted/20">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Input
                            placeholder={hasHistory ? 'Continue the conversation…' : 'e.g. "Sold 10 Indomie at ₦500 each"'}
                            {...field}
                            ref={(el) => {
                              (field as any).ref(el);
                              (inputRef as any).current = el;
                            }}
                            className="pr-4 h-11 text-sm bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl shadow-none"
                            disabled={isPending}
                            autoComplete="off"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={toggleListening}
                          className={cn(
                            'h-11 w-11 shrink-0 rounded-xl transition-all',
                            isListening
                              ? 'text-red-500 bg-red-100 dark:bg-red-900/30 hover:bg-red-100'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          )}
                          disabled={isPending}
                        >
                          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          type="submit"
                          className="h-11 w-11 shrink-0 rounded-xl bg-primary hover:bg-primary/90 shadow-sm"
                          disabled={isPending}
                        >
                          {isPending
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <ArrowUp className="h-4 w-4" />
                          }
                          <span className="sr-only">Send</span>
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

      </div>
    </div>
  );
}
