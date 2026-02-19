# Image Targets

Image targets are **not** local files. They are configured in the
[8th Wall console](https://www.8thwall.com/docs/guides/image-targets/).

## How it works

1. Upload your target image(s) in the 8th Wall developer console.
2. Give each target a unique **name** (e.g. `"my-target"`).
3. In your code, pass those exact names to the session config:

   ```ts
   start({
     mode: 'image-target',
     cameraDirection: 'back',
     imageTargets: ['my-target'],
   })
   ```

4. When the camera detects one of those images in the real world,
   the engine fires `reality.imagefound` with the target's position,
   rotation, and scale.

## Testing

Print your target image on paper or display it on a second screen.
Point the device camera at it. The 3D content should appear anchored
to the image.
