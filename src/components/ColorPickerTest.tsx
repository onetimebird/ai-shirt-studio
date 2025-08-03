import { useState } from "react";

export const ColorPickerTest = () => {
  const [testColor, setTestColor] = useState("#000000");

  return (
    <div className="p-4 border border-gray-300 m-4">
      <h3>Color Picker Test</h3>
      <p>Current color: {testColor}</p>
      <input
        type="color"
        value={testColor}
        onChange={(e) => {
          console.log('Test color picker changed to:', e.target.value);
          setTestColor(e.target.value);
        }}
        className="w-12 h-8 border rounded cursor-pointer"
        style={{ padding: 0 }}
      />
      <p>If this works, the issue is elsewhere.</p>
    </div>
  );
};