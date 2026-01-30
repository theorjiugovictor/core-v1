'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, ShoppingCart, Package, Info, Calculator, Zap } from 'lucide-react';

export default function HelpPage() {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h2 className="text-3xl font-heading font-bold tracking-tight">How to use CORE</h2>
                <p className="text-muted-foreground">Master your business with these simple commands and guides.</p>
            </div>

            <Tabs defaultValue="commands" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="commands">AI Commands</TabsTrigger>
                    <TabsTrigger value="guides">Quick Guides</TabsTrigger>
                    <TabsTrigger value="about">About App</TabsTrigger>
                </TabsList>

                {/* AI COMMANDS TAB */}
                <TabsContent value="commands" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">

                        <Card className="border-l-4 border-l-primary">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-primary" /> Recording Sales
                                </CardTitle>
                                <CardDescription>Speak naturally to record transactions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-2">
                                <div className="bg-muted p-2 rounded-md text-sm font-mono">"Sold 5 Meatpie"</div>
                                <div className="bg-muted p-2 rounded-md text-sm font-mono">"Sold 3 Rice at 2500 each"</div>
                                <div className="bg-muted p-2 rounded-md text-sm font-mono">"Sold 10 Gala and 5 Lacasera"</div>
                                <div className="bg-muted p-2 rounded-md text-sm font-mono">"Sold 20 bags of cement on credit to Mr John"</div>
                                <p className="text-xs text-muted-foreground">
                                    <span className="font-semibold text-primary">Tip:</span> You can mention price, quantity, and customer name in one sentence.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Package className="h-5 w-5 text-purple-500" /> Products & Recipes
                                </CardTitle>
                                <CardDescription>Create items and define what they are made of.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-2">
                                <div className="bg-muted p-2 rounded-md text-sm font-mono">"Create Product Jollof Rice at 1500"</div>
                                <div className="bg-muted p-2 rounded-md text-sm font-mono">
                                    "Create Meatpie at 500 made of 0.2kg flour and 1 egg"
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    <span className="font-semibold text-primary">Magic:</span> If you mention ingredients ("made of..."), CORE automatically links them so stock is deducted when you sell!
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-blue-500" /> Stock & Expenses
                                </CardTitle>
                                <CardDescription>Manage your inventory and costs.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-2">
                                <div className="bg-muted p-2 rounded-md text-sm font-mono">"Add 50 bags of sugar"</div>
                                <div className="bg-muted p-2 rounded-md text-sm font-mono">"How many bags of rice do I have?"</div>
                                <div className="bg-muted p-2 rounded-md text-sm font-mono">"Paid 5000 for transport"</div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-green-500" /> Chat & Insights
                                </CardTitle>
                                <CardDescription>Ask questions about your business.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-2">
                                <div className="bg-muted p-2 rounded-md text-sm font-mono">"How is my business doing today?"</div>
                                <div className="bg-muted p-2 rounded-md text-sm font-mono">"What is my best selling product?"</div>
                                <div className="bg-muted p-2 rounded-md text-sm font-mono">"Give me advice on how to grow"</div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* GUIDES TAB */}
                <TabsContent value="guides" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Retail vs. Manufacturing (The Two Modes)</CardTitle>
                            <CardDescription>CORE adapts to your business type.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">Mode 1</Badge>
                                    <h4 className="font-bold">Retailer (Buy & Sell)</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Best for shops, supermarkets, and boutiques.
                                </p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>Create products with just a Name and Price.</li>
                                    <li>When you sell, we track Revenue.</li>
                                    <li>Use "Add Stock" to track how many items you have left.</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="default">Mode 2</Badge>
                                    <h4 className="font-bold">Maker / Caterer (Make & Sell)</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Best for restaurants, bakeries, and factories.
                                </p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>Create products with a <b>Recipe</b> (e.g., Bread = Flour + Sugar).</li>
                                    <li>When you sell Bread, we automatically deduct Flour & Sugar.</li>
                                    <li>Helps you stop theft and wastage.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Workflows</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="bg-primary/10 p-2 rounded-full mt-1">
                                    <Zap className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Recording a Sale (Fastest Way)</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Don't waste time clicking. Just tap the microphone or type in the "AI Console" on the dashboard.
                                    </p>
                                    <code className="text-xs bg-muted px-2 py-1 rounded">"Sold 2 Coke"</code>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex gap-4 items-start">
                                <div className="bg-primary/10 p-2 rounded-full mt-1">
                                    <Info className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Checking Business Health</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Go to the <b>Insights</b> tab. The AI analyzes your sales daily and tells you exactly what to do to make more money.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ABOUT TAB */}
                <TabsContent value="about" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>About CORE</CardTitle>
                            <CardDescription>Version 1.0.0</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm">
                                CORE is designed to be the "Operating System" for African SMEs. It combines the power of an ERP with the simplicity of a chat app.
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h4 className="font-semibold mb-1">Built For:</h4>
                                    <ul className="list-disc list-inside text-muted-foreground">
                                        <li>Mobile First</li>
                                        <li>Low Data Usage</li>
                                        <li>Offline Capable (Coming Soon)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Support:</h4>
                                    <p className="text-muted-foreground">help@usecore.com</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
