import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const Calendar = ({
  selectedDate,
  onDateSelect,
  className,
  ...props
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = new Date()
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startDate = new Date(monthStart.setDate(monthStart.getDate() - monthStart.getDay()))
  const endDate = new Date(monthEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay())))

  const rows = []
  let days = []
  let day = startDate

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  const isToday = (date) => {
    return isSameDay(date, today)
  }

  const isSelected = (date) => {
    return selectedDate && isSameDay(date, selectedDate)
  }

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = new Date(day)
      days.push(
        <div
          key={cloneDay.toString()}
          className={cn(
            "h-10 w-10 text-center text-sm p-0 hover:bg-primary/10 transition-colors duration-200 cursor-pointer flex items-center justify-center rounded-lg relative",
            !isCurrentMonth(cloneDay) && "text-muted-foreground",
            isToday(cloneDay) && "bg-primary/20 text-primary font-semibold",
            isSelected(cloneDay) && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={() => onDateSelect && onDateSelect(new Date(cloneDay))}
        >
          <span className="relative z-10">{cloneDay.getDate()}</span>
          {isToday(cloneDay) && (
            <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse" />
          )}
        </div>
      )
      day.setDate(day.getDate() + 1)
    }
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7 gap-1">
        {days}
      </div>
    )
    days = []
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long" })
  const year = currentMonth.getFullYear()

  return (
    <Card className={cn("w-full max-w-md", className)} {...props}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {monthName} {year}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMonth}
              className="h-8 w-8 p-0 hover:bg-primary/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 p-0 hover:bg-primary/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="h-8 text-center text-sm font-medium text-muted-foreground flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-1">
          {rows}
        </div>

        {/* Selected date display */}
        {selectedDate && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-center text-primary font-medium">
              Selected: {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { Calendar }