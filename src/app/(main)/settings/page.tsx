import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mockUser } from "@/lib/data"

export default function SettingsPage() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your account and business settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6">
            <div className="grid gap-3">
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                id="business-name"
                type="text"
                className="w-full"
                defaultValue={mockUser.businessName}
                />
            </div>
            <div className="grid gap-3">
                <Label htmlFor="name">Your Name</Label>
                <Input
                id="name"
                type="text"
                className="w-full"
                defaultValue={mockUser.name}
                />
            </div>
            <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                className="w-full"
                defaultValue={mockUser.email}
                />
            </div>
        </form>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
