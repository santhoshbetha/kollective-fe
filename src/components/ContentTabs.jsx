import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

/**
 * @typedef {Object} TabItem
 * @property {string} id - Unique identifier for the tab
 * @property {string} label - Display label for the tab
 * @property {React.ComponentType<{className?: string}>} [icon] - Optional icon component
 * @property {React.ReactNode} [content] - Content to display when tab is active
 * @property {string|number} [badge] - Optional badge/count to show on tab
 */

/**
 * @typedef {Object} ContentTabsProps
 * @property {TabItem[]} tabs - Array of tab items
 * @property {string} [defaultValue] - Default active tab ID
 * @property {string} [className] - Additional CSS classes
 * @property {(value: string) => void} [onValueChange] - Callback when tab changes
 * @property {'default'|'pills'|'underline'} [variant] - Visual style variant
 * @property {'sm'|'md'|'lg'} [size] - Size of the tabs
 */

export const ContentTabs = ({
  tabs,
  defaultValue,
  className,
  onValueChange,
  variant = 'default',
  size = 'md'
}) => {
  const getTabsListClasses = () => {
    const baseClasses = "mb-6"

    switch (variant) {
      case 'pills':
        return cn(baseClasses, "bg-muted/30 p-1 rounded-lg flex border border-border/50")
      case 'underline':
        return cn(baseClasses, "bg-transparent border-b border-border rounded-none p-0 flex")
      default:
        return cn(baseClasses, "bg-muted/30 p-1 rounded-lg flex border border-border/50")
    }
  }

  const getTabsTriggerClasses = () => {
    const baseClasses = "flex-1 flex items-center justify-center gap-2 transition-all duration-200 font-medium"

    switch (variant) {
      case 'pills':
        return cn(baseClasses, "data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:scale-105 data-[state=active]:backdrop-blur-sm rounded-md hover:bg-muted/50")
      case 'underline':
        return cn(baseClasses, "data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/10 rounded-none border-b-2 border-transparent hover:text-foreground")
      default:
        return cn(baseClasses, "data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:scale-105 data-[state=active]:backdrop-blur-sm rounded-md hover:bg-muted/50")
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return "h-8 px-3 py-1 text-xs"
      case 'lg':
        return "h-12 px-6 py-3 text-base"
      default:
        return "h-10 px-4 py-2 text-sm"
    }
  }

  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.id}
      className={cn("w-full", className)}
      onValueChange={onValueChange}
    >
      <TabsList className={getTabsListClasses()}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(getTabsTriggerClasses(), getSizeClasses())}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className="hidden sm:inline truncate">{tab.label}</span>
              <span className="sm:hidden truncate">{tab.label.split(' ')[0]}</span>
              {tab.badge && (
                <span className="ml-1 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-200"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}