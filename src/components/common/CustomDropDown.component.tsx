import { useState, useRef, useEffect } from "react";
import Button from "./Button.component";

interface DropdownProps {
    label: string;
    items: { label: string; value: string }[];
    onSelect?: (value: string) => void;
    className?: string;
}

export default function Dropdown({
    label,
    items,
    onSelect,
    className,
}: DropdownProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(label);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item: { label: string; value: string }) => {
        setSelected(item.label);
        setOpen(false);
        onSelect?.(item.value);
    };
    useEffect(() => {
        setSelected(label);
    }, [label]);

    return (
        <div
            ref={ref}
            className={`relative inline-block text-left ${className ?? ""}`}
        >
            <Button
                onClick={() => setOpen(!open)}
                className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 cursor-pointer whitespace-nowrap"
            >
                {selected}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                </svg>
            </Button>

            {open && (
                <div
                    className="absolute left-7 mt-2 w-48 origin-top-right rounded-xl top-5 bg-white  transition-all z-[60]
          before:content-[''] before:absolute before:-top-3.5 before:right-3
          before:border-8 before:border-transparent before:border-b-white before:z-[-50]"
                >
                    <ul className="py-1 text-sm text-gray-700">
                        {items.map((item) => (
                            <li key={item.value}>
                                <button
                                    onClick={() => handleSelect(item)}
                                    className="block w-full px-4 py-2 text-left hover:bg-gray-100 rounded-lg transition cursor-pointer"
                                >
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
