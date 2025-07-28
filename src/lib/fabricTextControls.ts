// src/lib/fabricTextControls.ts
import { Canvas, Textbox, Control, controlsUtils, util as fabricUtil } from "fabric";
import deleteSvg  from "@/assets/icons/delete.svg";
import layerSvg   from "@/assets/icons/layer.svg";
import cloneSvg   from "@/assets/icons/clone.svg";
import stretchSvg from "@/assets/icons/stretch.svg";
import scaleSvg   from "@/assets/icons/scale.svg";
import rotateSvg  from "@/assets/icons/rotate.svg";

// Immediately invoked function to preload & patch—no top‐level await
(function installTextboxControls() {
  Promise.all([
    fabricUtil.loadImage(deleteSvg),
    fabricUtil.loadImage(layerSvg),
    fabricUtil.loadImage(cloneSvg),
    fabricUtil.loadImage(stretchSvg),
    fabricUtil.loadImage(scaleSvg),
    fabricUtil.loadImage(rotateSvg),
  ])
  .then(([deleteImg, layerImg, cloneImg, stretchImg, scaleImg, rotateImg]) => {
    // helper to build a control
    function makeControl(
      icon: HTMLImageElement,
      handler: any,
      pos: { x: number; y: number }
    ) {
      return new Control({
        x: pos.x,
        y: pos.y,
        cursorStyle: "pointer",
        actionHandler: handler,
        render(ctx, left, top, _, obj) {
          const size = Math.max(28, obj.getScaledHeight() * 0.12);
          ctx.save();
          ctx.translate(left, top);
          ctx.rotate((obj.angle * Math.PI) / 180);
          // background circle
          ctx.beginPath();
          ctx.arc(0, 0, size/2, 0, 2*Math.PI);
          ctx.fillStyle = "#fff";
          ctx.fill();
          ctx.strokeStyle = "#ddd";
          ctx.lineWidth = 1;
          ctx.stroke();
          // draw icon
          ctx.drawImage(icon, -size*0.3, -size*0.3, size*0.6, size*0.6);
          ctx.restore();
        },
      });
    }

    // Patch Textbox.prototype.controls
    Textbox.prototype.controls = {
      tl: makeControl(
        deleteImg,
        (_e, t) => { t.target.canvas.remove(t.target); return true; },
        { x:-0.5, y:-0.5 }
      ),
      mt: makeControl(
        layerImg,
        (_e, t) => { t.target.canvas.bringObjectToFront(t.target); return true; },
        { x: 0.0, y:-0.5 }
      ),
      tr: makeControl(
        cloneImg,
        (_e, t) => {
          t.target.clone((c: any) => {
            c.set({ left: t.target.left + 20, top: t.target.top + 20 });
            t.target.canvas.add(c).setActiveObject(c);
          });
          return true;
        },
        { x: 0.5, y:-0.5 }
      ),
      mr: makeControl(
        stretchImg,
        controlsUtils.scalingXOrSkewingY,
        { x: 0.5, y: 0.0 }
      ),
      br: makeControl(
        scaleImg,
        controlsUtils.scalingEqually,
        { x: 0.5, y: 0.5 }
      ),
      bl: makeControl(
        rotateImg,
        controlsUtils.rotationWithSnapping,
        { x:-0.5, y: 0.5 }
      ),
      mtr: makeControl(
        rotateImg,
        controlsUtils.rotationWithSnapping,
        { x: 0.0, y:-0.75 }
      ),
    };

    // Disable caching so icons always redraw
    Textbox.prototype.objectCaching = false;
  })
  .catch(err => {
    console.error("Failed to install Fabric textbox controls:", err);
  });
})();