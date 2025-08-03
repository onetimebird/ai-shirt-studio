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
          console.log('Test onChange triggered:', e.target.value);
          setTestColor(e.target.value);
        }}
        onInput={(e) => {
          console.log('Test onInput triggered:', (e.target as HTMLInputElement).value);
          setTestColor((e.target as HTMLInputElement).value);
        }}
        onBlur={(e) => {
          console.log('Test onBlur triggered:', e.target.value);
          setTestColor(e.target.value);
        }}
        className="w-12 h-8 border rounded cursor-pointer"
        style={{ 
          padding: 0,
          minWidth: '48px',
          minHeight: '32px'
        }}
        title="Click to select color"
      />
      <p>Safari fix with multiple event handlers - test this first!</p>
      <div className="w-8 h-8 border rounded" style={{ backgroundColor: testColor }}></div>
    </div>
  );
};