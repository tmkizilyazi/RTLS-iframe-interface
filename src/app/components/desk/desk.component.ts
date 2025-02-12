import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Seat {
  id: number;
  name: string;
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
            <label>
              <span>Şekil:</span>
              <select [(ngModel)]="tableShape" (change)="updateTable()">
                <option value="rectangle">Dikdörtgen</option>
                <option value="circle">Daire</option>
                <option value="oval">Oval</option>
                <option value="triangle">Üçgen</option>
              </select>
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
        <div class="desk-layout" [style.width.px]="tableWidth" [style.height.px]="tableLength"
             (mousedown)="startResize($event)">
          <div class="grid-overlay"></div>
          <div class="table" [ngClass]="tableShape"></div>
          <div *ngFor="let seat of seats; trackBy: trackBySeatId" 
               class="seat" 
               [class.occupied]="seat.isOccupied"
               [class.dragging]="draggedSeat?.id === seat.id"
               [style.transform]="getSeatTransform(seat)"
               (mousedown)="startDrag($event, seat)"
               (contextmenu)="rotateSeat($event, seat)">
            <div class="seat-info">
              <div class="sensor-id">{{seat.name}}</div>
              <div *ngIf="seat.signalStrength !== undefined" class="signal-indicator" [style.opacity]="getSeatSignalOpacity(seat)">
                <i class="fas fa-signal"></i>
              </div>
              <div *ngIf="seat.batteryLevel !== undefined" class="battery-indicator" [class.low]="isBatteryLow(seat)">
                <i class="fas fa-battery-half"></i>
              </div>
            </div>
            <div class="seat-icon">
              <div class="seat-back"></div>
              <div class="seat-bottom"></div>
            </div>
            <div class="status" [class.active]="seat.isOccupied">
              {{seat.isOccupied ? 'Dolu' : 'Boş'}}
              <span *ngIf="seat.lastUpdate" class="timestamp">
                {{seat.lastUpdate | date:'HH:mm:ss'}}
              </span>
            </div>
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
      background: url('/assets/images/wood.jpg') no-repeat center center;
      background-size: cover;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }

    .table.circle {
      border-radius: 50%;
    }

    .table.oval {
      border-radius: 50% / 25%;
    }

    .table.triangle {
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
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
  tableShape: 'rectangle' | 'circle' | 'oval' | 'triangle' = 'rectangle';
  draggedSeat: Seat | null = null;
  resizing = false;
  lastMouseX = 0;
  lastMouseY = 0;
  private intervalId: any;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: () => void;
  private handleIframeMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (data.seats) {
        this.updateSeatsFromIframe(data.seats);
      }
    } catch (error) {
      console.error('Error processing iframe message:', error);
    }
  };

  constructor() {
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
    this.handleIframeMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.seats) {
          this.updateSeatsFromIframe(data.seats);
        }
      } catch (error) {
        console.error('Error processing iframe message:', error);
      }
    };
  }

  ngOnInit() {
    this.initializeSeats();
    this.loadSeatPositions();
    this.setupEventListeners();
    this.setupIframeListener();
  }

  ngOnDestroy() {
    this.cleanupEventListeners();
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.handleIframeMessage);
    }
  }

  private setupEventListeners() {
    if (typeof document !== 'undefined') {
      document.addEventListener('mousemove', this.boundMouseMove);
      document.addEventListener('mouseup', this.boundMouseUp);
    }
  }

  private cleanupEventListeners() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousemove', this.boundMouseMove);
      document.removeEventListener('mouseup', this.boundMouseUp);
    }
  }

  private setupIframeListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleIframeMessage);
    }
  }

  initializeSeats() {
    const defaultPositions = [
      { x: 100, y: 100 }, { x: 100, y: 400 },
      { x: 600, y: 100 }, { x: 600, y: 400 }
    ];

    this.seats = defaultPositions.map((pos, index) => ({
      id: index + 1,
      name: `Seat ${index + 1}`,
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
      name: `Seat ${newId}`,
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
    } else if (this.resizing) {
      const deltaX = e.clientX - this.lastMouseX;
      const deltaY = e.clientY - this.lastMouseY;

      this.tableWidth = Math.max(400, this.tableWidth + deltaX);
      this.tableLength = Math.max(300, this.tableLength + deltaY);

      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  }

  private onMouseUp() {
    this.draggedSeat = null;
    this.resizing = false;
    this.saveSeatPositions();
  }

  startResize(event: MouseEvent) {
    if (event.button === 0) {
      event.preventDefault();
      this.resizing = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }
  }

  rotateSeat(event: MouseEvent, seat: Seat) {
    event.preventDefault();
    seat.rotation = (seat.rotation + 90) % 360;
    this.saveSeatPositions();
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

  trackBySeatId(index: number, seat: Seat): number {
    return seat.id;
  }

  private updateSeatsFromIframe(iframeSeats: any[]) {
    this.seats = this.seats.map(seat => {
      const iframeSeat = iframeSeats.find(s => s.id === seat.id);
      if (iframeSeat) {
        return {
          ...seat,
          isOccupied: iframeSeat.isOccupied,
          signalStrength: iframeSeat.signalStrength || 100,
          batteryLevel: iframeSeat.batteryLevel || 100,
          lastUpdate: new Date()
        };
      }
      return seat;
    });
  }

  private saveSeatPositions() {
    if (typeof localStorage !== 'undefined') {
      const data = {
        seats: this.seats.map(seat => ({
          id: seat.id,
          position: seat.position,
          rotation: seat.rotation
        })),
        tableWidth: this.tableWidth,
        tableLength: this.tableLength,
        tableShape: this.tableShape
      };
      localStorage.setItem('deskState', JSON.stringify(data));
    }
  }
  private loadSeatPositions() {
    if (typeof localStorage !== 'undefined') {
      const savedState = localStorage.getItem('deskState');
      if (savedState) {
        const { seats, tableWidth, tableLength, tableShape } = JSON.parse(savedState);
        this.seats = this.seats.map(seat => {
          const savedSeat = seats.find((s: any) => s.id === seat.id);
          if (savedSeat) {
            return {
              ...seat,
              position: savedSeat.position,
              rotation: savedSeat.rotation
            };
          }
          return seat;
        });
        this.tableWidth = tableWidth;
        this.tableLength = tableLength;
        this.tableShape = tableShape;
      }
    }
  }
}