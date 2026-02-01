'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Rocket, CheckCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getIdeasAction, createIdeaAction, deleteIdeaAction, updateIdeaStatusAction } from '@/lib/idea-actions';
import { Idea } from '@/lib/types';

export default function IdeasPage() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newIdeaContent, setNewIdeaContent] = useState('');
    const [newIdeaType, setNewIdeaType] = useState<Idea['type']>('note');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadIdeas();
    }, []);

    async function loadIdeas() {
        const data = await getIdeasAction();
        setIdeas(data);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newIdeaContent.trim()) return;

        setIsSubmitting(true);
        try {
            const result = await createIdeaAction({
                content: newIdeaContent,
                type: newIdeaType,
            });

            if (result.success) {
                toast({ title: "Idea captured!", description: "Where ideas go to grow." });
                setNewIdeaContent('');
                setIsDialogOpen(false);
                loadIdeas();
            } else {
                toast({ title: "Error", description: "Failed to save idea.", variant: "destructive" });
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Discard this idea?")) return;
        await deleteIdeaAction(id);
        loadIdeas();
    }

    async function handleStatusChange(id: string, status: Idea['status']) {
        await updateIdeaStatusAction(id, status);
        loadIdeas();
    }

    async function executeIdea(idea: Idea) {
        toast({
            title: "Initializing AI Execution...",
            description: `Analyzing strategy: "${idea.content.substring(0, 30)}..."`
        });
        // Placeholder for AI Execution Logic
        setTimeout(() => {
            toast({
                title: "Simulated Execution",
                description: "If the AI were fully connected, it would now be performing actions based on this note."
            })
        }, 1500);
    }

    const getStatusColor = (status: Idea['status']) => {
        switch (status) {
            case 'active': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'archived': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getTypeIcon = (type: Idea['type']) => {
        switch (type) {
            case 'strategy': return <Rocket className="h-4 w-4" />;
            case 'todo': return <CheckCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-muted-foreground">Capture ideas, plan strategies, and execute with AI.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> New Idea
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Capture New Idea</DialogTitle>
                            <DialogDescription>
                                What's on your mind? A strategy, a reminder, or a task for the AI?
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={newIdeaType} onValueChange={(v) => setNewIdeaType(v as Idea['type'])}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="note">Quick Note</SelectItem>
                                        <SelectItem value="strategy">Strategic Plan</SelectItem>
                                        <SelectItem value="todo">Task / To-Do</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Content</Label>
                                <Textarea
                                    placeholder="e.g. 'Increase prices by 10% next month' or 'Call supplier about bulk discount'"
                                    value={newIdeaContent}
                                    onChange={(e) => setNewIdeaContent(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save to Board'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ideas.map((idea) => (
                    <Card key={idea.id} className="relative group hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className={`gap-1 ${getStatusColor(idea.status)}`}>
                                    {getTypeIcon(idea.type)}
                                    {idea.type.toUpperCase()}
                                </Badge>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(idea.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{idea.content}</p>
                        </CardContent>
                        <CardFooter className="pt-2 flex justify-between border-t bg-muted/20 p-3">
                            <div className="text-xs text-muted-foreground">
                                {new Date(idea.createdAt).toLocaleDateString()}
                            </div>
                            {idea.status === 'active' && (
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleStatusChange(idea.id, 'completed')}>
                                        Done
                                    </Button>
                                    <Button size="sm" className="h-7 text-xs gap-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => executeIdea(idea)}>
                                        <Rocket className="h-3 w-3" /> Execute
                                    </Button>
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                ))}
                {ideas.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                        <Lightbulb className="h-12 w-12 mb-4 opacity-20" />
                        <p>No ideas yet. Start thinking big!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import { Lightbulb } from 'lucide-react';
