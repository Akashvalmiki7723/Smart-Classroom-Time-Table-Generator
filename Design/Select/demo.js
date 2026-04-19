import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { useId } from "react";

function Component() {
    const id = useId();
    return (
        <div className="space-y-2 min-w-[300px]">
            <Label htmlFor={id}>Select with helper text (native)</Label>
            <SelectNative id={id}>
                <option value="1">React</option>
                <option value="2">Next.js</option>
                <option value="3">Astro</option>
                <option value="4">Gatsby</option>
            </SelectNative>
            <p className="mt-2 text-xs text-muted-foreground" role="region" aria-live="polite">
                Tell us what&lsquo;s your favorite Select framework
            </p>
        </div>
    );
}

export { Component };
