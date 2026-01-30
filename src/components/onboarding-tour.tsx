"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Check, X } from "lucide-react";

export function OnboardingTour() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Check if user has seen the tour
        const hasSeenTour = localStorage.getItem("hasSeenOnboardingBeta1");
        if (!hasSeenTour) {
            // Small delay to let page load
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleComplete = () => {
        localStorage.setItem("hasSeenOnboardingBeta1", "true");
        setIsOpen(false);
    };

    const steps = [
        {
            title: "Hello! 👋",
            description: "Welcome to your new business assistant. Let's show you around quickly.",
            image: "👋",
        },
        {
            title: "Talk to Your App",
            description: "Type things like 'Sold 5 rice' or 'Add stock' in a box on the dashboard. It does the work for you.",
            image: "🎙️",
        },
        {
            title: "Check Your Profit",
            description: "See exactly how much money you are making after costs. We do the math for you.",
            image: "💰",
        },
        {
            title: "Need Help?",
            description: "Click the '?' button if you get stuck or want to see examples.",
            image: "❓",
        }
    ];

    const currentStep = steps[step];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleComplete}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center text-4xl mb-4">
                        {currentStep.image}
                    </div>
                    <DialogTitle className="text-center text-xl">{currentStep.title}</DialogTitle>
                    <DialogDescription className="text-center pt-2 text-base">
                        {currentStep.description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-between flex-row items-center gap-2 mt-4">
                    <div className="flex gap-1 justify-center flex-1">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 w-2 rounded-full transition-all ${i === step ? "bg-primary w-4" : "bg-muted-foreground/30"
                                    }`}
                            />
                        ))}
                    </div>
                    <Button onClick={handleNext} className="gap-2">
                        {step === steps.length - 1 ? (
                            <>
                                Let's Go <Check className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Next <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
