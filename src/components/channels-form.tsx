'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateChannelsAction } from '@/lib/actions';
import type { User } from '@/lib/types';

const formSchema = z.object({
  whatsappPhone: z
    .string()
    .regex(/^\d{10,15}$/, 'Enter your number without + or spaces (e.g. 2348012345678)')
    .or(z.literal('')),
  telegramId: z
    .string()
    .regex(/^\d+$/, 'Telegram ID must be a number — send /start to our bot to find yours')
    .or(z.literal('')),
});

interface ChannelsFormProps {
  user: User;
}

export function ChannelsForm({ user }: ChannelsFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      whatsappPhone: user.whatsappPhone || '',
      telegramId: user.telegramId || '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await updateChannelsAction({
        whatsappPhone: values.whatsappPhone || undefined,
        telegramId: values.telegramId || undefined,
      });

      if (result.success) {
        toast({
          title: 'Channels Updated',
          description: 'Your connected channels have been saved.',
          className: 'bg-green-500 text-white border-none',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update channels.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-lg bg-card/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle>Connected Channels</CardTitle>
        <CardDescription>
          Link your WhatsApp or Telegram to record sales, check stock, and get insights without opening the app.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="whatsappPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    WhatsApp Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="2348012345678"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Your number with country code, no + or spaces.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telegramId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-500" />
                    Telegram ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456789"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Find your ID by sending <code className="text-xs bg-muted px-1 py-0.5 rounded">/start</code> to our Telegram bot.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4 bg-muted/20">
            <Button type="submit" disabled={isPending} className="ml-auto">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Channels
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
