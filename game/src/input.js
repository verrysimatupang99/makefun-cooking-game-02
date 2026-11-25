export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.justPressed = new Set();
    this.mouse = { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 };
    this.onFirstGesture = null;
    this.gestured = false;
    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      this.keys.add(event.code);
      this.justPressed.add(event.code);
      this.gesture();
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    });
    window.addEventListener('keyup', (event) => this.keys.delete(event.code));
    window.addEventListener('blur', () => this.keys.clear());
    canvas.addEventListener('mousemove', (event) => this.setPointer(event, canvas));
    canvas.addEventListener('mousedown', (event) => {
      this.setPointer(event, canvas);
      this.mouse.clicked = true;
      this.mouse.clickX = this.mouse.x;
      this.mouse.clickY = this.mouse.y;
      this.gesture();
    });
  }

  setPointer(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = (event.clientX - rect.left) * canvas.width / rect.width;
    this.mouse.y = (event.clientY - rect.top) * canvas.height / rect.height;
  }

  gesture() {
    if (this.gestured) return;
    this.gestured = true;
    this.onFirstGesture?.();
  }

  moveVector() {
    let x = Number(this.keys.has('KeyD') || this.keys.has('ArrowRight')) - Number(this.keys.has('KeyA') || this.keys.has('ArrowLeft'));
    let y = Number(this.keys.has('KeyS') || this.keys.has('ArrowDown')) - Number(this.keys.has('KeyW') || this.keys.has('ArrowUp'));
    if (x && y) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
    return { x, y };
  }

  interactHeld() { return this.keys.has('KeyE') || this.keys.has('Space'); }
  pressed(code) { return this.justPressed.has(code); }
  anyConfirm() { return this.pressed('Enter') || this.pressed('NumpadEnter') || this.mouse.clicked; }
  endFrame() { this.justPressed.clear(); this.mouse.clicked = false; }
}
