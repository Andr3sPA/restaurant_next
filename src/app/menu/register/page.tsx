import RegisterMenuItem from "@/components/registerMenuItem";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterMenuPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent>
      <RegisterMenuItem />
        </CardContent>
      </Card>
    </div>
  );
}