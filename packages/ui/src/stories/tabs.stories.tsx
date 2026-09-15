import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../index";
const meta = { title: "Molecules/Tabs", component: Tabs } satisfies Meta<
  typeof Tabs
>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Tabs defaultValue="general">
      <TabsList aria-label="Campaign settings">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="recipients">Recipients</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Results
        </TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        Configure your campaign name and description.
      </TabsContent>
      <TabsContent value="recipients">
        Select a target group for this simulation.
      </TabsContent>
      <TabsContent value="schedule">
        Choose when to start the campaign.
      </TabsContent>
    </Tabs>
  ),
};
