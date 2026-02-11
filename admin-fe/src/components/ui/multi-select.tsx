import * as React from "react"
import { X, Check, ChevronsUpDown, Search } from "lucide-react"
import { Badge } from "./badge"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { cn } from "@/lib/utils"
import { Input } from "./input"

export interface Option {
  id: string
  name: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  maxItems?: number
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  maxItems = 5,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const handleSelect = (optionName: string) => {
    if (selected.includes(optionName)) {
      onChange(selected.filter((s) => s !== optionName))
    } else {
      if (selected.length < maxItems) {
        onChange([...selected, optionName])
      }
    }
  }

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((item) => (
          <Badge key={item} variant="secondary" className="gap-1 pl-2">
            {item}
            <button
              type="button"
              onClick={() => onChange(selected.filter((s) => s !== item))}
              className="ml-1 hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {selected.length === 0 && (
          <span className="text-sm text-muted-foreground italic">{placeholder}</span>
        )}
      </div>
      
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-transparent font-normal border-dashed h-10 hover:bg-accent/50"
            disabled={selected.length >= maxItems && !open}
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              {selected.length >= maxItems 
                ? `Maximum ${maxItems} tags reached` 
                : "Browse tags..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-0" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder="Search tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs border-none focus-visible:ring-0 px-1"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <p className="text-xs text-center py-4 text-muted-foreground">No tags found.</p>
            ) : (
              filteredOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onSelect={(e) => {
                    e.preventDefault()
                    handleSelect(option.name)
                  }}
                  className="flex items-center justify-between py-2"
                >
                  <span className={cn(
                    "text-sm",
                    selected.includes(option.name) && "font-semibold text-primary"
                  )}>
                    {option.name}
                  </span>
                  {selected.includes(option.name) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
