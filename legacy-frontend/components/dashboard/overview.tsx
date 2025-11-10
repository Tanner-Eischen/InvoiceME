import React from "react";

// In a real app, we would use a proper chart library like recharts
// For now we'll create a simple bar chart with CSS
export function Overview() {
  // Mock data for the chart
  const data = [
    { name: "Jan", total: 1500 },
    { name: "Feb", total: 2300 },
    { name: "Mar", total: 1800 },
    { name: "Apr", total: 2800 },
    { name: "May", total: 3200 },
    { name: "Jun", total: 2700 },
    { name: "Jul", total: 3900 },
    { name: "Aug", total: 3600 },
    { name: "Sep", total: 2800 },
    { name: "Oct", total: 3100 },
    { name: "Nov", total: 4200 },
    { name: "Dec", total: 3400 },
  ];

  const maxValue = Math.max(...data.map(item => item.total));

  return (
    <div className="w-full h-[300px] flex items-end gap-2">
      {data.map((item, index) => (
        <div
          key={index}
          className="relative group flex flex-1 flex-col items-center"
        >
          <div className="w-full absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-100 text-center text-sm">
            ${item.total}
          </div>
          <div
            className="w-full bg-primary/90 hover:bg-primary rounded-t-sm"
            style={{
              height: `${(item.total / maxValue) * 250}px`,
            }}
          ></div>
          <div className="mt-2 text-xs text-center">
            {item.name}
          </div>
        </div>
      ))}
    </div>
  );
}
