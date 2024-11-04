import { Button } from "@/components/ui/button";
import { Video } from "@/lib/drizzle/schema";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

type PostDetailsProps = {
  video: Video;
  scheduledDate: Date;
  onScheduledDateChange: (date: Date) => void;
  onBack: () => void;
  onNext: () => void;
};

export function PostDetails({
  video,
  scheduledDate,
  onScheduledDateChange,
  onBack,
  onNext,
}: PostDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Video Preview */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <video
          src={video.filePath}
          className="max-h-[300px] w-full rounded-lg object-contain"
          controls
        />
        <p className="mt-2 text-sm font-medium">{video.title}</p>
      </div>

      {/* Schedule */}
      <div className="flex gap-4">
        <div>
          <label className="text-sm font-medium">Schedule Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="mt-1 w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {scheduledDate ? (
                  format(scheduledDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={scheduledDate}
                onSelect={(date) => date && onScheduledDateChange(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="text-sm font-medium mt-4">Schedule Time</label>
          <Select
            onValueChange={(value) => {
              const [hours, minutes] = value.split(":").map(Number);
              const newDate = new Date(scheduledDate);
              newDate.setHours(hours, minutes);
              onScheduledDateChange(newDate);
            }}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 36 }, (_, i) => {
                const hours = String(Math.floor(i / 2) + 6).padStart(2, "0");
                const minutes = i % 2 === 0 ? "00" : "30";
                return (
                  <SelectItem key={i} value={`${hours}:${minutes}`}>
                    {`${hours}:${minutes}`}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
