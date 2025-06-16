import { Signup1 } from "@/components/signup1";
import { CardContent, Card } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent>
          <Signup1/>
        </CardContent>
      </Card>
    </div>

  );
}