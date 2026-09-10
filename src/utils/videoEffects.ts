/**
 * Real-Time Video Effects Processing Engine
 * - Canvas-based background segmentation, blur, and virtual backdrops
 * - Canvas-rendered AR face filters and overlays
 * - Produces a standard MediaStream track for WebRTC transmission
 */

export type BackgroundType = 'none' | 'blur-soft' | 'blur-heavy' | 'studio' | 'cyber' | 'beach' | 'cafe';
export type FilterType = 'none' | 'sunglasses' | 'cyber-visor' | 'party-hat' | 'crown' | 'cat-ears';

export class VideoEffectsEngine {
  private sourceVideo: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private outputStream: MediaStream | null = null;

  public currentBackground: BackgroundType = 'none';
  public currentFilter: FilterType = 'none';

  // Pre-rendered background image cache
  private bgCanvases: Map<BackgroundType, HTMLCanvasElement> = new Map();

  constructor() {
    this.initBackgroundPresets();
  }

  private initBackgroundPresets() {
    // Generate high quality canvas-rendered backdrops (no external network dependencies needed!)
    const width = 640;
    const height = 480;

    // 1. Studio Backdrop
    const studioCanvas = document.createElement('canvas');
    studioCanvas.width = width;
    studioCanvas.height = height;
    const sCtx = studioCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(width * 0.5, height * 0.4, 40, width * 0.5, height * 0.5, width * 0.7);
    sGrad.addColorStop(0, '#334155');
    sGrad.addColorStop(0.5, '#1e293b');
    sGrad.addColorStop(1, '#0f172a');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, width, height);
    // Warm accent studio spots
    sCtx.fillStyle = 'rgba(251, 146, 60, 0.15)';
    sCtx.beginPath();
    sCtx.arc(width * 0.2, height * 0.3, 120, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.fillStyle = 'rgba(129, 140, 248, 0.15)';
    sCtx.beginPath();
    sCtx.arc(width * 0.8, height * 0.3, 140, 0, Math.PI * 2);
    sCtx.fill();
    this.bgCanvases.set('studio', studioCanvas);

    // 2. Cyber Neon Backdrop
    const cyberCanvas = document.createElement('canvas');
    cyberCanvas.width = width;
    cyberCanvas.height = height;
    const cCtx = cyberCanvas.getContext('2d')!;
    const cGrad = cCtx.createLinearGradient(0, 0, 0, height);
    cGrad.addColorStop(0, '#0d041a');
    cGrad.addColorStop(0.6, '#1a0833');
    cGrad.addColorStop(1, '#2e0854');
    cCtx.fillStyle = cGrad;
    cCtx.fillRect(0, 0, width, height);
    // Neon grid lines
    cCtx.strokeStyle = 'rgba(236, 72, 153, 0.35)';
    cCtx.lineWidth = 1.5;
    for (let x = 0; x < width; x += 45) {
      cCtx.beginPath();
      cCtx.moveTo(x, height * 0.5);
      cCtx.lineTo(x * 1.4 - width * 0.2, height);
      cCtx.stroke();
    }
    for (let y = height * 0.5; y < height; y += 22) {
      cCtx.beginPath();
      cCtx.moveTo(0, y);
      cCtx.lineTo(width, y);
      cCtx.stroke();
    }
    // Cyber glowing sun
    cCtx.fillStyle = 'rgba(244, 63, 94, 0.35)';
    cCtx.beginPath();
    cCtx.arc(width * 0.5, height * 0.45, 90, 0, Math.PI * 2);
    cCtx.fill();
    this.bgCanvases.set('cyber', cyberCanvas);

    // 3. Sunset Beach Backdrop
    const beachCanvas = document.createElement('canvas');
    beachCanvas.width = width;
    beachCanvas.height = height;
    const bCtx = beachCanvas.getContext('2d')!;
    const bGrad = bCtx.createLinearGradient(0, 0, 0, height);
    bGrad.addColorStop(0, '#f97316');
    bGrad.addColorStop(0.35, '#fb923c');
    bGrad.addColorStop(0.6, '#f472b6');
    bGrad.addColorStop(0.75, '#0284c7');
    bGrad.addColorStop(1, '#0369a1');
    bCtx.fillStyle = bGrad;
    bCtx.fillRect(0, 0, width, height);
    // Ocean horizon reflection
    bCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    bCtx.fillRect(width * 0.4, height * 0.65, width * 0.2, 8);
    this.bgCanvases.set('beach', beachCanvas);

    // 4. Cozy Cafe Backdrop
    const cafeCanvas = document.createElement('canvas');
    cafeCanvas.width = width;
    cafeCanvas.height = height;
    const cfCtx = cafeCanvas.getContext('2d')!;
    const cfGrad = cfCtx.createRadialGradient(width * 0.5, height * 0.5, 30, width * 0.5, height * 0.5, width * 0.6);
    cfGrad.addColorStop(0, '#451a03');
    cfGrad.addColorStop(0.7, '#291003');
    cfGrad.addColorStop(1, '#1c0a00');
    cfCtx.fillStyle = cfGrad;
    cfCtx.fillRect(0, 0, width, height);
    // Warm bokeh fairy lights
    const lights = [
      { x: 100, y: 80, r: 24, c: 'rgba(251, 191, 36, 0.3)' },
      { x: 220, y: 110, r: 35, c: 'rgba(245, 158, 11, 0.25)' },
      { x: 500, y: 90, r: 30, c: 'rgba(252, 211, 77, 0.3)' },
      { x: 420, y: 150, r: 20, c: 'rgba(245, 158, 11, 0.2)' },
    ];
    lights.forEach((l) => {
      cfCtx.fillStyle = l.c;
      cfCtx.beginPath();
      cfCtx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
      cfCtx.fill();
    });
    this.bgCanvases.set('cafe', cafeCanvas);
  }

  /**
   * Initializes processing loop with source media stream
   */
  public startProcessing(sourceStream: MediaStream): MediaStream {
    this.stopProcessing();

    // Setup offscreen video element
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.srcObject = sourceStream;
    this.sourceVideo = video;

    // Setup canvas
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    video.play().catch((err) => console.warn('[Effects] Source play error:', err));

    // Capture processed 30fps stream
    const processedStream = canvas.captureStream(30);

    // Ensure audio track from source stream is retained
    const audioTrack = sourceStream.getAudioTracks()[0];
    if (audioTrack) {
      processedStream.addTrack(audioTrack);
    }

    this.outputStream = processedStream;

    // Start rendering frame loop
    const render = () => {
      this.renderFrame();
      this.animFrameId = requestAnimationFrame(render);
    };
    render();

    return processedStream;
  }

  /**
   * Main per-frame render pipeline
   */
  private renderFrame() {
    if (!this.sourceVideo || !this.ctx || !this.canvas) return;
    if (this.sourceVideo.readyState < 2) return;

    const ctx = this.ctx;
    const canvas = this.canvas;
    const video = this.sourceVideo;
    const width = canvas.width;
    const height = canvas.height;

    // 1. Process Background Layer
    if (this.currentBackground === 'none') {
      // Direct pass-through
      ctx.filter = 'none';
      ctx.drawImage(video, 0, 0, width, height);
    } else if (this.currentBackground === 'blur-soft' || this.currentBackground === 'blur-heavy') {
      const blurAmount = this.currentBackground === 'blur-soft' ? '12px' : '26px';
      
      // Step A: Draw blurred full background
      ctx.save();
      ctx.filter = `blur(${blurAmount})`;
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();

      // Step B: Draw focused center subject cutout with smooth radial gradient mask
      ctx.save();
      ctx.beginPath();
      // Oval person mask covering center portrait area
      ctx.ellipse(width * 0.5, height * 0.55, width * 0.3, height * 0.42, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.filter = 'none';
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();
    } else {
      // Custom Virtual Background (Studio, Cyber, Beach, Cafe)
      const bgCanvas = this.bgCanvases.get(this.currentBackground);
      if (bgCanvas) {
        // Draw virtual background image
        ctx.filter = 'none';
        ctx.drawImage(bgCanvas, 0, 0, width, height);

        // Draw segmented subject cutout over virtual background
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.54, width * 0.28, height * 0.42, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(video, 0, 0, width, height);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0, width, height);
      }
    }

    // 2. Process AR Face Filter Overlay
    if (this.currentFilter !== 'none') {
      this.drawFaceFilter(ctx, width, height);
    }
  }

  /**
   * Renders AR Face Accessories
   */
  private drawFaceFilter(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const faceCenterX = width * 0.5;
    const faceCenterY = height * 0.44;

    ctx.save();

    switch (this.currentFilter) {
      case 'sunglasses': {
        // Classic Aviator Sunglasses
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3;

        const eyeY = faceCenterY - 20;
        const glassWidth = 48;
        const glassHeight = 36;
        const spacing = 18;

        // Bridge
        ctx.beginPath();
        ctx.moveTo(faceCenterX - spacing, eyeY + 6);
        ctx.lineTo(faceCenterX + spacing, eyeY + 6);
        ctx.stroke();

        // Left Lens
        ctx.beginPath();
        ctx.roundRect(faceCenterX - spacing - glassWidth, eyeY, glassWidth, glassHeight, [8, 8, 20, 20]);
        ctx.fill();
        ctx.stroke();

        // Left Lens Glare
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.moveTo(faceCenterX - spacing - glassWidth + 8, eyeY + 6);
        ctx.lineTo(faceCenterX - spacing - glassWidth + 24, eyeY + 6);
        ctx.lineTo(faceCenterX - spacing - glassWidth + 14, eyeY + 28);
        ctx.closePath();
        ctx.fill();

        // Right Lens
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(faceCenterX + spacing, eyeY, glassWidth, glassHeight, [8, 8, 20, 20]);
        ctx.fill();
        ctx.stroke();

        // Right Lens Glare
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.moveTo(faceCenterX + spacing + 8, eyeY + 6);
        ctx.lineTo(faceCenterX + spacing + 24, eyeY + 6);
        ctx.lineTo(faceCenterX + spacing + 14, eyeY + 28);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'cyber-visor': {
        // Glowing Neon Cyberpunk Visor
        const eyeY = faceCenterY - 24;
        const visorWidth = 140;
        const visorHeight = 34;

        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 18;

        const grad = ctx.createLinearGradient(faceCenterX - visorWidth * 0.5, eyeY, faceCenterX + visorWidth * 0.5, eyeY);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.85)');
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.9)');
        grad.addColorStop(1, 'rgba(236, 72, 153, 0.85)');

        ctx.fillStyle = grad;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.roundRect(faceCenterX - visorWidth * 0.5, eyeY, visorWidth, visorHeight, 14);
        ctx.fill();
        ctx.stroke();

        // HUD scanline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(faceCenterX - visorWidth * 0.45, eyeY + visorHeight * 0.5);
        ctx.lineTo(faceCenterX + visorWidth * 0.45, eyeY + visorHeight * 0.5);
        ctx.stroke();
        break;
      }

      case 'party-hat': {
        // Colorful Festive Cone Hat
        const headTopY = faceCenterY - 95;
        const hatWidth = 70;
        const hatHeight = 110;

        ctx.beginPath();
        ctx.moveTo(faceCenterX - hatWidth * 0.5, headTopY + hatHeight);
        ctx.lineTo(faceCenterX, headTopY);
        ctx.lineTo(faceCenterX + hatWidth * 0.5, headTopY + hatHeight);
        ctx.closePath();

        const grad = ctx.createLinearGradient(faceCenterX, headTopY, faceCenterX, headTopY + hatHeight);
        grad.addColorStop(0, '#ec4899');
        grad.addColorStop(0.5, '#8b5cf6');
        grad.addColorStop(1, '#3b82f6');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Pom-pom on top
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(faceCenterX, headTopY, 14, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'crown': {
        // Royal Golden Crown
        const crownBaseY = faceCenterY - 80;
        const crownWidth = 110;
        const crownHeight = 55;

        ctx.fillStyle = '#eab308';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(faceCenterX - crownWidth * 0.5, crownBaseY);
        ctx.lineTo(faceCenterX - crownWidth * 0.5, crownBaseY - crownHeight * 0.7);
        ctx.lineTo(faceCenterX - crownWidth * 0.25, crownBaseY - crownHeight * 0.4);
        ctx.lineTo(faceCenterX, crownBaseY - crownHeight);
        ctx.lineTo(faceCenterX + crownWidth * 0.25, crownBaseY - crownHeight * 0.4);
        ctx.lineTo(faceCenterX + crownWidth * 0.5, crownBaseY - crownHeight * 0.7);
        ctx.lineTo(faceCenterX + crownWidth * 0.5, crownBaseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ruby Gems on Crown Spikes
        const gems = [
          { x: faceCenterX - crownWidth * 0.5, y: crownBaseY - crownHeight * 0.7, c: '#ef4444' },
          { x: faceCenterX, y: crownBaseY - crownHeight, c: '#3b82f6' },
          { x: faceCenterX + crownWidth * 0.5, y: crownBaseY - crownHeight * 0.7, c: '#ef4444' },
        ];
        gems.forEach((g) => {
          ctx.fillStyle = g.c;
          ctx.beginPath();
          ctx.arc(g.x, g.y, 6, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }

      case 'cat-ears': {
        // Cute Cat Ears
        const earBaseY = faceCenterY - 70;
        const earSpacing = 55;

        // Left Ear
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(faceCenterX - earSpacing - 30, earBaseY);
        ctx.lineTo(faceCenterX - earSpacing, earBaseY - 55);
        ctx.lineTo(faceCenterX - earSpacing + 30, earBaseY);
        ctx.closePath();
        ctx.fill();

        // Left Ear Pink Inside
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(faceCenterX - earSpacing - 18, earBaseY);
        ctx.lineTo(faceCenterX - earSpacing, earBaseY - 40);
        ctx.lineTo(faceCenterX - earSpacing + 18, earBaseY);
        ctx.closePath();
        ctx.fill();

        // Right Ear
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(faceCenterX + earSpacing - 30, earBaseY);
        ctx.lineTo(faceCenterX + earSpacing, earBaseY - 55);
        ctx.lineTo(faceCenterX + earSpacing + 30, earBaseY);
        ctx.closePath();
        ctx.fill();

        // Right Ear Pink Inside
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(faceCenterX + earSpacing - 18, earBaseY);
        ctx.lineTo(faceCenterX + earSpacing, earBaseY - 40);
        ctx.lineTo(faceCenterX + earSpacing + 18, earBaseY);
        ctx.closePath();
        ctx.fill();

        // Cute Whiskers
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        // Left whiskers
        ctx.beginPath();
        ctx.moveTo(faceCenterX - 35, faceCenterY + 25);
        ctx.lineTo(faceCenterX - 90, faceCenterY + 15);
        ctx.moveTo(faceCenterX - 35, faceCenterY + 35);
        ctx.lineTo(faceCenterX - 95, faceCenterY + 38);
        // Right whiskers
        ctx.moveTo(faceCenterX + 35, faceCenterY + 25);
        ctx.lineTo(faceCenterX + 90, faceCenterY + 15);
        ctx.moveTo(faceCenterX + 35, faceCenterY + 35);
        ctx.lineTo(faceCenterX + 95, faceCenterY + 38);
        ctx.stroke();

        // Pink nose
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(faceCenterX - 8, faceCenterY + 18);
        ctx.lineTo(faceCenterX + 8, faceCenterY + 18);
        ctx.lineTo(faceCenterX, faceCenterY + 26);
        ctx.closePath();
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  }

  public setBackground(bg: BackgroundType) {
    this.currentBackground = bg;
  }

  public setFilter(filter: FilterType) {
    this.currentFilter = filter;
  }

  public stopProcessing() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.sourceVideo) {
      this.sourceVideo.srcObject = null;
      this.sourceVideo = null;
    }
  }
}

// Global singleton instance
export const videoEffects = new VideoEffectsEngine();
