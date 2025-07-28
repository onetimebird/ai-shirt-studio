// src/lib/fabricTextControls.ts
import { Textbox, Control, controlsUtils, util as fabricUtil } from "fabric";
import deleteSvg  from "@/assets/icons/delete.svg";
import layerSvg   from "@/assets/icons/layer.svg";
import cloneSvg   from "@/assets/icons/clone.svg";
import stretchSvg from "@/assets/icons/stretch.svg";
import scaleSvg   from "@/assets/icons/scale.svg";
import rotateSvg  from "@/assets/icons/rotate.svg";

;(async function installTextboxControls() {
  try {
    const [
      deleteImg,
      layerImg,
      cloneImg,
      stretchImg,
      scaleImg,
      rotateImg
    ] = await Promise.all([
      fabricUtil.loadImage(deleteSvg),
      fabricUtil.loadImage(layerSvg),
      fabricUtil.loadImage(cloneSvg),
      fabricUtil.loadImage(stretchSvg),
      fabricUtil.loadImage(scaleSvg),
      fabricUtil.loadImage(rotateSvg),
    ]);

    // Factory to create a Control with your SVG
    const makeControl = (
      icon: HTMLImageElement,
      handler: any,
      pos: { x: number; y: number }
    ) => new Control({
      x: pos.x,
      y: pos.y,
      cursorStyle: "pointer",
      actionHandler: handler,
      render(ctx, left, top, _, obj) {
        const size = Math.max(28, (obj as any).getScaledHeight() * 0.12);
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(((obj as any).angle * Math.PI) / 180);
        // background circle
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 1;
        ctx.stroke();
        // icon
        ctx.drawImage(icon, -size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
        ctx.restore();
      },
    });

    // Handlers for each icon
    const deleteHandler = (_e: any, t: any) => {
      t.target.canvas.remove(t.target);
      return true;
    };
    const layerHandler = (_e: any, t: any) => {
      t.target.canvas.bringObjectToFront(t.target);
      return true;
    };
    const cloneHandler = (_e: any, t: any) => {
      t.target.clone((cloned: any) => {
        cloned.set({ left: t.target.left + 20, top: t.target.top + 20 });
        t.target.canvas.add(cloned);
        t.target.canvas.setActiveObject(cloned);
      });
      return true;
    };

    // Patch every future Textbox to use your custom controls
    Textbox.prototype.controls = {
      tl: makeControl(deleteImg,  deleteHandler,                           { x: -0.5, y: -0.5 }),
      mt: makeControl(layerImg,   layerHandler,                            { x:  0.0, y: -0.5 }),
      tr: makeControl(cloneImg,   cloneHandler,                            { x:  0.5, y: -0.5 }),
      mr: makeControl(stretchImg, controlsUtils.scalingXOrSkewingY,        { x:  0.5, y:  0.0 }),
      br: makeControl(scaleImg,   controlsUtils.scalingEqually,            { x:  0.5, y:  0.5 }),
      bl: makeControl(rotateImg,  controlsUtils.rotationWithSnapping,      { x: -0.5, y:  0.5 }),
      mtr:makeControl(rotateImg,  controlsUtils.rotationWithSnapping,      { x:  0.0, y: -0.75 }),
    };

    // Disable caching so your icons always redraw
    Textbox.prototype.objectCaching = false;

    console.log("✅ Fabric textbox controls installed");
  } catch (err) {
    console.error("❌ Failed to install Fabric textbox controls:", err);
  }
})();