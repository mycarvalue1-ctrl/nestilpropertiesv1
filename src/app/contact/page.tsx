import { Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  return (
    <div className="bg-background">
      <div className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
              Contact Us
            </h1>
            <p className="mt-4 text-xl text-foreground/80">
              We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
                    <p className="text-muted-foreground">
                        Have a question, feedback, or need support? Fill out the form, and we'll get back to you as soon as possible.
                    </p>
                </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Mail className="h-6 w-6 text-primary"/>
                        <a href="mailto:helpnestil@gmail.com" className="text-lg hover:text-primary">helpnestil@gmail.com</a>
                    </div>
                     <div className="flex items-center gap-4">
                        <Phone className="h-6 w-6 text-primary"/>
                        <span className="text-lg">+91 12345 67890</span>
                    </div>
                     <div className="flex items-center gap-4">
                        <MapPin className="h-6 w-6 text-primary"/>
                        <span className="text-lg">Vijayawada, Andhra Pradesh</span>
                    </div>
                </div>
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Send a Message</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Your Name" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="Your Email Address" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="How can we help you?" rows={5} />
                        </div>
                        <Button className="w-full">Submit</Button>
                    </CardContent>
                 </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
