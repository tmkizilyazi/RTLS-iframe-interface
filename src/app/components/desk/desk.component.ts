import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Seat {
  id: number;
  isOccupied: boolean;
  position: { x: number; y: number };
  rotation: number;
  lastUpdate?: Date;
  signalStrength?: number;
  batteryLevel?: number;
  style?: {
    width: number;
    height: number;
    color: string;
  };
}

@Component({
  selector: 'app-desk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard">
      <div class="control-panel">
        <h2>Masa Kontrol Paneli</h2>
        <div class="controls">
          <button (click)="addSeat()" class="control-btn add">
            <i class="fas fa-plus"></i> Yeni Koltuk
          </button>
          <div class="size-controls">
            <label>
              <span>Masa Genişliği:</span>
              <input type="range" [(ngModel)]="tableWidth" (change)="updateTable()" min="400" max="1200" step="50">
              <span>{{tableWidth}}px</span>
            </label>
            <label>
              <span>Masa Uzunluğu:</span>
              <input type="range" [(ngModel)]="tableLength" (change)="updateTable()" min="300" max="800" step="50">
              <span>{{tableLength}}px</span>
            </label>
          </div>
          <div class="style-controls">
            <label>
              <span>Koltuk Genişliği:</span>
              <input type="number" [(ngModel)]="seatStyle.width" (change)="updateSeatsStyle()" min="40" max="100">
            </label>
            <label>
              <span>Koltuk Rengi:</span>
              <input type="color" [(ngModel)]="seatStyle.color" (change)="updateSeatsStyle()">
            </label>
          </div>
        </div>
      </div>

      <div class="workspace">
        <div class="desk-container" [style.width.px]="tableWidth + 100" [style.height.px]="tableLength + 100">
          <div class="desk-layout" [style.width.px]="tableWidth" [style.height.px]="tableLength">
            <div class="table" [style.background]="tableColor"></div>
            @for (seat of seats; track seat.id) {
              <div class="seat" 
                   [class.occupied]="seat.isOccupied"
                   [class.dragging]="draggedSeat?.id === seat.id"
                   [style.transform]="getSeatTransform(seat)"
                   [style.width.px]="seat.style?.width"
                   [style.height.px]="seat.style?.width"
                   (mousedown)="startDrag($event, seat)"
                   (contextmenu)="rotateSeat($event, seat)">
                <div class="seat-content" [style.background]="seat.style?.color">
                  <div class="seat-number">{{seat.id}}</div>
                  @if (seat.isOccupied) {
                    <div class="status-indicator"></div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .control-panel {
      background: rgba(255,255,255,0.9);
      padding: 25px;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(31,38,135,0.15);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.18);
    }

    .controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 25px;
      margin-top: 25px;
      padding: 15px;
      background: rgba(248,249,250,0.8);
      border-radius: 15px;
    }

    h2 {
      color: #2c3e50;
      font-size: 1.8em;
      margin-bottom: 15px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .size-controls, .style-controls {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .control-btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      background: #4CAF50;
      color: white;
    }

    .desk-container {
      position: relative;
      padding: 50px;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .desk-layout {
      position: relative;
      background: #f8f9fa;
      border-radius: 15px;
      transition: all 0.3s ease;
    }

    .table {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      height: 80%;
      background: linear-gradient(145deg, #3d4a5c, #2c3e50);
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
      border: 2px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
    }

    .seat {
      position: absolute;
      cursor: move;
      user-select: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .seat-content {
      width: 100%;
      height: 100%;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: linear-gradient(145deg, #2196F3, #1976D2);
      box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
      border: 2px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(5px);
      transform-style: preserve-3d;
      perspective: 1000px;
    }

    .seat-content:before {
      content: '';
      position: absolute;
      width: 80%;
      height: 10%;
      bottom: -5px;
      left: 10%;
      background: rgba(0,0,0,0.2);
      filter: blur(4px);
      border-radius: 50%;
    }

    .seat:hover .seat-content {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(33, 150, 243, 0.4);
    }

    .seat-number {
      color: white;
      font-weight: bold;
    }

    .status-indicator {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4CAF50;
      box-shadow: 0 0 8px #4CAF50;
    }

    .occupied .status-indicator {
      background: #f44336;
      box-shadow: 0 0 8px #f44336;
    }

    input[type="range"] {
      width: 100%;
      margin: 10px 0;
    }

    input[type="number"], input[type="color"] {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 6px;
      width: 100px;
    }

    label {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  `]
})
export class DeskComponent implements OnInit, OnDestroy {
  seats: Seat[] = [];
  tableWidth = 800;
  tableLength = 600;
  tableColor = 'linear-gradient(145deg, #8B4513, #A0522D)';
  draggedSeat: Seat | null = null;
  lastMouseX = 0;
  lastMouseY = 0;
  seatStyle = {
    width: 70,
    height: 70,
    color: 'linear-gradient(145deg, #2196F3, #1976D2)'
  };

  constructor() {
    this.loadState();
  }

  ngOnInit() {
    if (this.seats.length === 0) {
      this.initializeSeats();
    }
    this.setupEventListeners();
  }

  ngOnDestroy() {
    this.saveState();
    this.cleanupEventListeners();
  }

  private setupEventListeners() {
    if (typeof document !== 'undefined') {
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
      document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }
  }

  private cleanupEventListeners() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousemove', this.onMouseMove.bind(this));
      document.removeEventListener('mouseup', this.onMouseUp.bind(this));
    }
  }

  private saveState() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('deskState', JSON.stringify({
        seats: this.seats,
        tableWidth: this.tableWidth,
        tableLength: this.tableLength,
        seatStyle: this.seatStyle
      }));
    }
  }

  private loadState() {
    if (typeof localStorage !== 'undefined') {
      const state = localStorage.getItem('deskState');
      if (state) {
        const parsedState = JSON.parse(state);
        this.seats = parsedState.seats;
        this.tableWidth = parsedState.tableWidth;
        this.tableLength = parsedState.tableLength;
        this.seatStyle = parsedState.seatStyle;
      }
    }
  }

  initializeSeats() {
    const defaultPositions = [
      { x: 100, y: 100 }, { x: 100, y: 400 },
      { x: 600, y: 100 }, { x: 600, y: 400 }
    ];

    this.seats = defaultPositions.map((pos, index) => ({
      id: index + 1,
      isOccupied: false,
      position: pos,
      rotation: 0,
      style: { ...this.seatStyle }
    }));
  }

  updateSeatsStyle() {
    this.seats = this.seats.map(seat => ({
      ...seat,
      style: { ...this.seatStyle }
    }));
    this.saveState();
  }

  addSeat() {
    const newId = Math.max(0, ...this.seats.map(s => s.id)) + 1;
    this.seats.push({
      id: newId,
      isOccupied: false,
      position: { x: this.tableWidth / 2, y: this.tableLength / 2 },
      rotation: 0,
      style: { ...this.seatStyle }
    });
    this.saveState();
  }

  updateTable() {
    this.seats = this.seats.map(seat => ({
      ...seat,
      position: {
        x: Math.min(Math.max(0, seat.position.x), this.tableWidth - (seat.style?.width || 60)),
        y: Math.min(Math.max(0, seat.position.y), this.tableLength - (seat.style?.width || 60))
      }
    }));
    this.saveState();
  }

  startDrag(event: MouseEvent, seat: Seat) {
    if (event.button === 0) {
      event.preventDefault();
      this.draggedSeat = seat;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }
  }

  private onMouseMove(e: MouseEvent) {
    if (this.draggedSeat) {
      const deltaX = e.clientX - this.lastMouseX;
      const deltaY = e.clientY - this.lastMouseY;

      const seatWidth = this.draggedSeat.style?.width || 60;
      const newX = Math.min(Math.max(0, this.draggedSeat.position.x + deltaX), this.tableWidth - seatWidth);
      const newY = Math.min(Math.max(0, this.draggedSeat.position.y + deltaY), this.tableLength - seatWidth);

      this.draggedSeat.position = { x: newX, y: newY };
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.saveState();
    }
  }

  private onMouseUp() {
    if (this.draggedSeat) {
      this.saveState();
    }
    this.draggedSeat = null;
  }

  rotateSeat(event: MouseEvent, seat: Seat) {
    event.preventDefault();
    seat.rotation = (seat.rotation + 90) % 360;
    this.saveState();
  }

  getSeatTransform(seat: Seat): string {
    return `translate(${seat.position.x}px, ${seat.position.y}px) rotate(${seat.rotation}deg)`;
  }
}