'use client';

import { useState } from 'react';
import { Mail, User, Search, X, Loader2, Check, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Input,
  InputGroup,
  InputAddon,
} from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function ComponentsDemo() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const toggleLoading = (id: string) => {
    setLoading(prev => ({
      ...prev,
      [id]: !prev[id],
    }));

    // Auto reset after 2 seconds
    setTimeout(() => {
      setLoading(prev => ({
        ...prev,
        [id]: false,
      }));
    }, 2000);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">Components Demo</h1>
        <p className="text-muted-foreground">
          This page showcases the enhanced UI components with different variants.
        </p>
      </div>

      <Tabs defaultValue="buttons">
        <TabsList className="w-full grid grid-cols-3 mb-8">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>
                Different visual styles for the Button component.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2 items-center">
                <Button variant="default">Default</Button>
                <span className="text-sm text-muted-foreground mt-2">Default</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button variant="destructive">Destructive</Button>
                <span className="text-sm text-muted-foreground mt-2">Destructive</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button variant="outline">Outline</Button>
                <span className="text-sm text-muted-foreground mt-2">Outline</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button variant="secondary">Secondary</Button>
                <span className="text-sm text-muted-foreground mt-2">Secondary</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button variant="ghost">Ghost</Button>
                <span className="text-sm text-muted-foreground mt-2">Ghost</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button variant="link">Link</Button>
                <span className="text-sm text-muted-foreground mt-2">Link</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button variant="success">Success</Button>
                <span className="text-sm text-muted-foreground mt-2">Success</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button variant="warning">Warning</Button>
                <span className="text-sm text-muted-foreground mt-2">Warning</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button variant="info">Info</Button>
                <span className="text-sm text-muted-foreground mt-2">Info</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
              <CardDescription>
                Different size options for the Button component.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-2 items-center">
                <Button size="sm">Small Button</Button>
                <span className="text-sm text-muted-foreground mt-2">Small</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button size="default">Default Button</Button>
                <span className="text-sm text-muted-foreground mt-2">Default</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button size="lg">Large Button</Button>
                <span className="text-sm text-muted-foreground mt-2">Large</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button States</CardTitle>
              <CardDescription>
                Interactive states for buttons including loading state.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2 items-center">
                <Button disabled>Disabled</Button>
                <span className="text-sm text-muted-foreground mt-2">Disabled</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button
                  isLoading={loading['loading']}
                  onClick={() => toggleLoading('loading')}
                >
                  {loading['loading'] ? 'Loading...' : 'Click to Load'}
                </Button>
                <span className="text-sm text-muted-foreground mt-2">Loading</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button
                  variant="success"
                  onClick={() => toggleLoading('success')}
                  isLoading={loading['success']}
                >
                  {loading['success'] ? 'Processing...' : 'Submit Form'}
                </Button>
                <span className="text-sm text-muted-foreground mt-2">Success Action</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button
                  variant="destructive"
                  onClick={() => toggleLoading('delete')}
                  isLoading={loading['delete']}
                >
                  {loading['delete'] ? 'Deleting...' : 'Delete Item'}
                </Button>
                <span className="text-sm text-muted-foreground mt-2">Destructive Action</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button Shapes</CardTitle>
              <CardDescription>
                Different rounded options for buttons.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-2 items-center">
                <Button rounded="default" variant="outline">Default Rounded</Button>
                <span className="text-sm text-muted-foreground mt-2">Default Rounded</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button rounded="full" variant="outline">Full Rounded</Button>
                <span className="text-sm text-muted-foreground mt-2">Full Rounded</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button rounded="none" variant="outline">No Rounding</Button>
                <span className="text-sm text-muted-foreground mt-2">No Rounding</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Card Variants</CardTitle>
              <CardDescription>
                Different visual styles for the Card component.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>This is the default card style</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card uses the default styling with a subtle shadow.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Outline Card</CardTitle>
                  <CardDescription>Card with emphasized border</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card has a more prominent border and no shadow.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline">Action</Button>
                </CardFooter>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Flat Card</CardTitle>
                  <CardDescription>Card without shadows</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card has no shadow, giving it a flat appearance.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="ghost">Action</Button>
                </CardFooter>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>Card with pronounced shadow</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card has a more pronounced shadow effect.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="secondary">Action</Button>
                </CardFooter>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Interactive Card</CardTitle>
                  <CardDescription>Card with hover effects</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card has interactive hover effects.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card Padding Options</CardTitle>
              <CardDescription>
                Different padding options for the Card component.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Small Padding</CardTitle>
                  <CardDescription>Compact card layout</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card has smaller padding for a more compact look.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Default Padding</CardTitle>
                  <CardDescription>Standard card layout</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card uses the default padding values.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Large Padding</CardTitle>
                  <CardDescription>Spacious card layout</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card has larger padding for a more spacious look.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inputs" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Input Variants</CardTitle>
              <CardDescription>
                Different visual styles for the Input component.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Input</label>
                <Input placeholder="Default input style" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Underlined Input</label>
                <Input placeholder="Underlined input style" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pill Input</label>
                <Input rounded="full" placeholder="Pill-shaped input" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Input States</CardTitle>
              <CardDescription>
                Different state styles for the Input component.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default State</label>
                <Input placeholder="Default state" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Error State</label>
                <Input placeholder="Error state" />
                <p className="text-sm text-destructive">This field is required</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Success State</label>
                <Input placeholder="Success state" />
                <p className="text-sm text-green-500">Input is valid</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Input with Icons</CardTitle>
              <CardDescription>
                Input components with left and right icons.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">Left Icon</label>
                <Input placeholder="Email address" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Right Icon</label>
                <Input placeholder="Search..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Both Icons</label>
                <Input placeholder="Username" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Icons with Pill Style</label>
                <Input rounded="full" placeholder="Search..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Input Groups</CardTitle>
              <CardDescription>
                Input with prepended and appended elements.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input with Prefix</label>
                <InputGroup>
                  <InputAddon>$</InputAddon>
                  <Input size="md" className="rounded-l-none" placeholder="0.00" />
                </InputGroup>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Input with Suffix</label>
                <InputGroup>
                  <Input size="md" className="rounded-r-none" placeholder="100" />
                  <InputAddon>%</InputAddon>
                </InputGroup>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Input with Button</label>
                <InputGroup>
                  <Input size="md" className="rounded-r-none" placeholder="Search..." />
                  <Button className="rounded-l-none">Search</Button>
                </InputGroup>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Input with Both</label>
                <InputGroup>
                  <InputAddon>https://</InputAddon>
                  <Input size="md" className="rounded-none" placeholder="example.com" />
                  <InputAddon>.com</InputAddon>
                </InputGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Input Sizes</CardTitle>
              <CardDescription>
                Different size options for the Input component.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">Small Input</label>
                <Input size="sm" placeholder="Small input" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Default Input</label>
                <Input size="md" placeholder="Default input" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Large Input</label>
                <Input size="lg" placeholder="Large input" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
