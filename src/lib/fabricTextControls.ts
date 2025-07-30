// src/lib/fabricTextControls.ts
import { Textbox, Text, Control, controlsUtils } from "fabric";

// Base64-inlined SVG icons
const deleteIcon  = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8cGF0aCBkPSJtMyA2IDMgMTJjMCAuNi40IDEgMSAxaDhjLjYgMCAxLS40IDEtMWwzLTEyIi8+CiAgPHBhdGggZD0iTTggNlY0YzAtLjYuNC0xIDEtMWg0Yy42IDAgMSAuNCAxIDF2MiIvPgogIDxsaW5lIHgxPSIxMCIgeDI9IjEwIiB5MT0iMTEiIHkyPSIxNyIvPgogIDxsaW5lIHgxPSIxNCIgeDI9IjE0IiB5MT0iMTEiIHkyPSIxNyIvPgo8L3N2Zz4=";
const layerIcon   = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8cG9seWxpbmUgcG9pbnRzPSI5IDEwIDQgMTUgOSAyMCIvPgogIDxwYXRoIGQ9Im0yMCA0LTUgNWgtNCIvPgogIDxsaW5lIHgxPSIxNSIgeDI9IjIwIiB5MT0iOSIgeTI9IjQiLz4KPC9zdmc+";
const cloneIcon   = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8cmVjdCB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHg9IjgiIHk9IjgiIHJ4PSIyIiByeT0iMiIvPgogIDxwYXRoIGQ9Ik00IDE2Yy0xLjEgMC0yLS45LTItMlY0YzAtMS4xLjktMiAyLTJoMTBjMS4xIDAgMiAuOSAyIDIiLz4KPC9zdmc+";
const stretchIcon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8cG9seWxpbmUgcG9pbnRzPSI1IDkgMiAxMiA1IDE1Ii8+CiAgPHBvbHlsaW5lIHBvaW50cz0iMTkgOSAyMiAxMiAxOSAxNSIvPgogIDxsaW5lIHgxPSIyIiB4Mj0iMjIiIHkxPSIxMiIgeTI9IjEyIi8+Cjwvc3ZnPg==";
const scaleIcon   = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8cGF0aCBkPSJNMjEgMyA5IDE1Ii8+CiAgPHBhdGggZD0iTTEyIDNoOXY5Ii8+CiAgPHBhdGggZD0iTTMgMjEgMTUgOSIvPgogIDxwYXRoIGQ9Ik0zIDEydjloOSIvPgo8L3N2Zz4=";
const rotateIcon  = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8cGF0aCBkPSJNMjEgMTJhOSA5IDAgMCAwLTktOSA5Ljc1IDkuNzUgMCAwIDAtNi43NCAyLjc0TDMgOCIvPgogIDxwYXRoIGQ9Ik0zIDN2NWg1Ii8+CiAgPHBhdGggZD0iTTMgMTJhOSA5IDAgMCAwIDkgOSA5Ljc1IDkuNzUgMCAwIDAgNi43NC0yLjc0TDIxIDE2Ii8+CiAgPHBhdGggZD0iTTE2IDE2aDV2NSIvPgo8L3N2Zz4=";

// Helper to create an HTMLImageElement from data-URL
function makeImg(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload  = () => res(img);
    img.onerror = (e) => rej(e);
    img.src     = url;
  });
}

;(async function installControls() {
  try {
    const [del, lay, clo, str, sca, rot] = await Promise.all([
      makeImg(deleteIcon),
      makeImg(layerIcon),
      makeImg(cloneIcon),
      makeImg(stretchIcon),
      makeImg(scaleIcon),
      makeImg(rotateIcon),
    ]);

    const makeControl = (
      icon: HTMLImageElement,
      handler: any,
      pos: { x: number; y: number }
    ) => new Control({
      x: pos.x, y: pos.y,
      cursorStyle: "pointer",
      actionHandler: handler,
      render(ctx, left, top, _, obj) {
        const size = Math.max(28, (obj as any).getScaledHeight() * 0.12);
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(((obj as any).angle * Math.PI) / 180);
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2*Math.PI);
        ctx.fillStyle   = "#fff";
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth   = 1;
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(icon, -size*0.3, -size*0.3, size*0.6, size*0.6);
        ctx.restore();
      }
    });

    const deleteH = (_e:any, t:any) => (t.target.canvas.remove(t.target), true);
    const layerH  = (_e:any, t:any) => (t.target.canvas.bringObjectToFront(t.target), true);
    const cloneH  = (_e:any, t:any) => {
      t.target.clone((c:any) => {
        c.set({ left: t.target.left+20, top: t.target.top+20 });
        t.target.canvas.add(c);
        t.target.canvas.setActiveObject(c);
      });
      return true;
    };

    // Apply controls to both Textbox and Text classes
    const controls = {
      tl: makeControl(del, deleteH, { x:-0.5, y:-0.5 }),
      mt: makeControl(lay, layerH,  { x: 0.0, y:-0.5 }),
      tr: makeControl(clo, cloneH,  { x: 0.5, y:-0.5 }),
      mr: makeControl(str, controlsUtils.scalingXOrSkewingY, { x:0.5, y:0.0 }),
      br: makeControl(sca, controlsUtils.scalingEqually,     { x:0.5, y:0.5 }),
      bl: makeControl(rot, controlsUtils.rotationWithSnapping,{ x:-0.5,y:0.5 }),
      mtr:makeControl(rot, controlsUtils.rotationWithSnapping,{ x:0.0, y:-0.75 }),
    };

    Textbox.prototype.controls = controls;
    Text.prototype.controls = controls;
    
    Textbox.prototype.objectCaching = false;
    Text.prototype.objectCaching = false;
    console.log("✅ Inline Fabric controls installed");
  } catch(err) {
    console.error("❌ Inline Fabric controls error:", err);
  }
})();