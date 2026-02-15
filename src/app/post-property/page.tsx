import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"

export default function PostPropertyPage() {
  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Post a New Property</CardTitle>
          <CardDescription>
            Fill in the details below to put your property on the market.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-lg">Property Title</Label>
            <Input id="title" placeholder="e.g., Beautiful 3-Bedroom Family Home" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-lg">Listing Type</Label>
              <Select>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select listing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="lease">For Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="property-type" className="text-lg">Property Type</Label>
              <Select>
                <SelectTrigger id="property-type">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="flat">Flat</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-lg">Price (₹)</Label>
              <Input id="price" type="number" placeholder="e.g., 4500000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area" className="text-lg">Area (sq ft)</Label>
              <Input id="area" type="number" placeholder="e.g., 2200" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-lg">Full Address</Label>
            <Input id="address" placeholder="e.g., 123 Maple Street, Springfield" />
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="description" className="text-lg">Description</Label>
            <Textarea id="description" placeholder="Describe your property in detail..." rows={5} />
          </div>
          
          <div className="space-y-2">
            <Label className="text-lg">Photos</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary">
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2"/>
                <p className="text-muted-foreground">Click or drag files here to upload</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>

           <div className="space-y-2">
            <Label htmlFor="phone" className="text-lg">Contact Phone Number</Label>
            <Input id="phone" type="tel" placeholder="e.g., 9876543210" />
          </div>
          
          <Button size="lg" className="w-full" variant="accent">Submit for Approval</Button>

        </CardContent>
      </Card>
    </div>
  )
}
