import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-6">
      <Badge className="w-fit">MVP Foundation</Badge>
      <Card>
        <CardHeader>
          <CardTitle>LLM Debate Arena</CardTitle>
          <CardDescription>
            Core project setup is complete and ready for ticket implementation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Debate Topic</Label>
            <Input id="topic" placeholder="Is open source AI safer long term?" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select>
              <SelectTrigger id="model">
                <SelectValue placeholder="Choose a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai/gpt-4o-mini">GPT-4o mini</SelectItem>
                <SelectItem value="anthropic/claude-3.5-sonnet">
                  Claude 3.5 Sonnet
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective">Objective</Label>
            <Textarea id="objective" placeholder="Persuade the audience with concise evidence." />
          </div>

          <Separator />
          <Button>Start Debate</Button>
        </CardContent>
      </Card>
    </main>
  );
}
