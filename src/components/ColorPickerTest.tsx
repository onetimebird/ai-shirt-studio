import { useState } from "react";
import { CustomColorPicker } from "./CustomColorPicker";

export const ColorPickerTest = () => {
  const [testColor, setTestColor] = useState("#000000");

  return (
    <div className="p-4 border border-gray-300 m-4">
      <h3>Color Picker Test</h3>
      <p>Current color: {testColor}</p>
      <CustomColorPicker
        value={testColor}
        onChange={(color) => {
          console.log('Custom color picker changed to:', color);
          setTestColor(color);
        }}
      />
      <p>Custom color picker for Safari compatibility!</p>
      <div className="w-8 h-8 border rounded mt-2" style={{ backgroundColor: testColor }}></div>
    </div>
  );
};