# @xr-engine/r3f-bridge Examples

Working examples demonstrating how to build AR applications using React Three Fiber and the 8th Wall XR engine.

## Prerequisites

1. **Node.js 18+**

2. **Build the parent library first:**
   ```bash
   # From the repository root
   npm install
   npm run build
   ```

3. **8th Wall Engine URLs:**
   Each example needs the 8th Wall engine script URLs from a [Buildable Code Export](https://www.8thwall.com/docs/migration/self-hosted/).

   In each example directory, copy `.env.example` to `.env.local` and fill in your URLs:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your engine URLs
   ```

## Running an Example

```bash
cd examples/basic-ar    # (or face-effects, image-targets, multi-experience)
npm install
npm run dev
```

The dev server starts over HTTPS (required for camera access). Your browser will show a self-signed certificate warning -- accept it to proceed.

## Mobile Testing

All AR features require a mobile device with a camera. To test on your phone:

1. Ensure your phone is on the same network as your dev machine.
2. The dev server binds to all interfaces (`--host` is included in the dev script).
3. Visit `https://<your-local-ip>:5173` on your phone.
4. Accept the self-signed certificate warning.

Find your local IP with `ifconfig` (Mac/Linux) or `ipconfig` (Windows).

## Examples

### basic-ar (Beginner)

The simplest possible SLAM AR application. A rotating 3D box floating in the real world. Demonstrates the minimum wiring needed: `Canvas` > `XRProvider` > `XRRenderBridge` > `XRCameraBackground` > scene content.

### face-effects (Intermediate)

Face tracking with 3D objects attached to face landmarks. Shows front camera configuration, face event subscriptions (`facefound`, `faceupdated`, `facelost`), and positioning content at face attachment points (eyes, nose, forehead).

### image-targets (Intermediate)

Image target detection where 3D content appears anchored to a recognized image. Shows the image target event lifecycle and how to position Three.js groups at target locations. Image targets must be configured in the 8th Wall console.

### multi-experience (Advanced)

The flagship example. A mini-app with navigation between three experiences sharing a single canvas:
- **World AR** -- SLAM tracking with 3D objects in the real world
- **Face AR** -- Face tracking with face-attached content
- **3D Viewer** -- A pure non-XR 3D scene with orbit controls

Demonstrates on-demand engine loading, mode switching via `switchMode()`, session start/stop on mount/unmount, and seamless transitions between AR and non-AR experiences.
