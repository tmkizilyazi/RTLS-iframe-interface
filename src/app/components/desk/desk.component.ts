
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
}

@Component({
  selector: 'app-desk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard">
      <div class="control-panel">
        <h2>RTLS Masa Kontrol Paneli</h2>
        <div class="controls">
          <button (click)="addSeat()" class="control-btn add">
            <i class="fas fa-plus"></i> Sensör Ekle
          </button>
          <div class="size-controls">
            <label>
              <span>Genişlik:</span>
              <input type="number" [(ngModel)]="tableWidth" (change)="updateTable()" min="400" max="1200" step="50">
            </label>
            <label>
              <span>Uzunluk:</span>
              <input type="number" [(ngModel)]="tableLength" (change)="updateTable()" min="300" max="800" step="50">
            </label>
          </div>
        </div>
        <div class="stats">
          <div class="stat-item">
            <span>Toplam Sensör:</span>
            <strong>{{seats.length}}</strong>
          </div>
          <div class="stat-item">
            <span>Aktif Sensör:</span>
            <strong>{{getActiveSeats()}}</strong>
          </div>
        </div>
      </div>

      <div class="workspace">
        <div class="desk-layout" [style.width.px]="tableWidth" [style.height.px]="tableLength">
          <div class="grid-overlay"></div>
          <div class="table"></div>
          @for (seat of seats; track seat.id) {
            <div class="seat" 
                 [class.occupied]="seat.isOccupied"
                 [class.dragging]="draggedSeat?.id === seat.id"
                 [style.transform]="getSeatTransform(seat)"
                 (mousedown)="startDrag($event, seat)"
                 (contextmenu)="rotateSeat($event, seat)">
              <div class="seat-info">
                <div class="sensor-id">ID: {{seat.id}}</div>
                @if (seat.signalStrength !== undefined) {
                  <div class="signal-indicator" [style.opacity]="getSeatSignalOpacity(seat)">
                    <i class="fas fa-signal"></i>
                  </div>
                }
                @if (seat.batteryLevel !== undefined) {
                  <div class="battery-indicator" [class.low]="isBatteryLow(seat)">
                    <i class="fas fa-battery-half"></i>
                  </div>
                }
              </div>
              <div class="seat-icon">
                <div class="seat-back"></div>
                <div class="seat-bottom"></div>
              </div>
              <div class="status" [class.active]="seat.isOccupied">
                {{seat.isOccupied ? 'Dolu' : 'Boş'}}
                @if (seat.lastUpdate) {
                  <span class="timestamp">
                    {{seat.lastUpdate | date:'HH:mm:ss'}}
                  </span>
                }
              </div>
            </div>
          }
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
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    h2 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 20px 0;
    }

    .size-controls {
      display: flex;
      gap: 20px;
    }

    .control-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .control-btn.add {
      background: #4CAF50;
      color: white;
    }

    .control-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .stats {
      display: flex;
      gap: 30px;
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .workspace {
      display: flex;
      justify-content: center;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .desk-layout {
      position: relative;
      background: #e9ecef;
      border-radius: 15px;
      transition: all 0.3s ease;
    }

    .grid-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 20px 20px;
      border-radius: 15px;
    }

    .table {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      height: 60%;
      background: linear-gradient(145deg, #8B4513, #A0522D);
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }

    .seat {
      position: absolute;
      width: 80px;
      height: 80px;
      cursor: move;
      user-select: none;
      transition: transform 0.2s ease;
    }

    .seat-info {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      font-size: 12px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      opacity: 0;
      transition: opacity 0.3s;
      white-space: nowrap;
    }

    .seat:hover .seat-info {
      opacity: 1;
    }

    .seat-icon {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .seat-back {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 25px;
      background: #555;
      border-radius: 5px 5px 0 0;
    }

    .seat-bottom {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 50px;
      background: #666;
      border-radius: 8px;
    }

    .seat.occupied .seat-back,
    .seat.occupied .seat-bottom {
      background: #e74c3c;
    }

    .seat:not(.occupied) .seat-back,
    .seat:not(.occupied) .seat-bottom {
      background: #2ecc71;
    }

    .status {
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      white-space: nowrap;
    }

    .status.active {
      background: rgba(231, 76, 60, 0.9);
    }

    .battery-indicator.low {
      color: #e74c3c;
    }

    input[type="number"] {
      width: 80px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }

    .dragging {
      opacity: 0.8;
      z-index: 1000;
    }

    label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class DeskComponent implements OnInit, OnDestroy {
  seats: Seat[] = [];
  tableWidth = 800;
  tableLength = 600;
  draggedSeat: Seat | null = null;
  lastMouseX = 0;
  lastMouseY = 0;
  private intervalId: any;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: () => void;

  constructor() {
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
  }

  ngOnInit() {
    this.initializeSeats();
    this.setupEventListeners();
    this.startSimulation();
  }

  ngOnDestroy() {
    this.cleanupEventListeners();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private setupEventListeners() {
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  private cleanupEventListeners() {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  private startSimulation() {
    this.intervalId = setInterval(() => {
      this.updateRandomSeats();
    }, 5000);
  }

  private updateRandomSeats() {
    this.seats = this.seats.map(seat => ({
      ...seat,
      isOccupied: Math.random() > 0.5,
      signalStrength: Math.random() * 100,
      batteryLevel: Math.random() * 100,
      lastUpdate: new Date()
    }));
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
      signalStrength: 100,
      batteryLevel: 100,
      lastUpdate: new Date()
    }));
  }

  addSeat() {
    const newId = Math.max(0, ...this.seats.map(s => s.id)) + 1;
    this.seats.push({
      id: newId,
      isOccupied: false,
      position: { x: 200, y: 200 },
      rotation: 0,
      signalStrength: 100,
      batteryLevel: 100,
      lastUpdate: new Date()
    });
  }

  updateTable() {
    this.seats = this.seats.map(seat => ({
      ...seat,
      position: {
        x: Math.min(Math.max(0, seat.position.x), this.tableWidth - 80),
        y: Math.min(Math.max(0, seat.position.y), this.tableLength - 80)
      }
    }));
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
      
      const newX = Math.min(Math.max(0, this.draggedSeat.position.x + deltaX), this.tableWidth - 80);
      const newY = Math.min(Math.max(0, this.draggedSeat.position.y + deltaY), this.tableLength - 80);
      
      this.draggedSeat.position = { x: newX, y: newY };
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  }

  private onMouseUp() {
    this.draggedSeat = null;
  }

  rotateSeat(event: MouseEvent, seat: Seat) {
    event.preventDefault();
    seat.rotation = (seat.rotation + 90) % 360;
  }

  getSeatTransform(seat: Seat): string {
    return `translate(${seat.position.x}px, ${seat.position.y}px) rotate(${seat.rotation}deg)`;
  }

  getSeatSignalOpacity(seat: Seat): number {
    return seat.signalStrength ? seat.signalStrength / 100 : 0.5;
  }

  isBatteryLow(seat: Seat): boolean {
    return seat.batteryLevel ? seat.batteryLevel < 20 : false;
  }

  getActiveSeats(): number {
    return this.seats.filter(seat => seat.isOccupied).length;
  }
}
