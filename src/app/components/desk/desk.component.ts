
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Seat {
  id: number;
  isOccupied: boolean;
  position: { x: number; y: number };
  rotation: number;
}

@Component({
  selector: 'app-desk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="desk-container">
      <div class="controls">
        <button (click)="addSeat()" class="control-btn">Koltuk Ekle</button>
        <label>Masa Genişliği:
          <input type="number" [(ngModel)]="tableWidth" (change)="updateTable()" min="200" max="1000" step="50">
        </label>
        <label>Masa Uzunluğu:
          <input type="number" [(ngModel)]="tableLength" (change)="updateTable()" min="200" max="1000" step="50">
        </label>
      </div>
      
      <div class="desk-layout" [style.width.px]="tableWidth" [style.height.px]="tableLength">
        <div class="table"></div>
        <div *ngFor="let seat of seats" 
             class="seat" 
             [class.occupied]="seat.isOccupied"
             [style.transform]="'translate(' + seat.position.x + 'px, ' + seat.position.y + 'px) rotate(' + seat.rotation + 'deg)'"
             (click)="toggleSeat(seat.id)"
             (mousedown)="startDrag($event, seat)"
             (contextmenu)="rotateSeat($event, seat)">
          <div class="seat-icon">
            <div class="seat-back"></div>
            <div class="seat-bottom"></div>
          </div>
          <div class="status">{{seat.isOccupied ? 'Dolu' : 'Boş'}}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .desk-container {
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .controls {
      margin-bottom: 20px;
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .control-btn {
      padding: 8px 16px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .control-btn:hover {
      background: #45a049;
    }
    .desk-layout {
      position: relative;
      margin: 20px;
      background: #f5f5f5;
      border-radius: 10px;
    }
    .table {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      height: 60%;
      background: #8B4513;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    .seat {
      position: absolute;
      width: 60px;
      height: 60px;
      cursor: move;
      user-select: none;
    }
    .seat-icon {
      width: 100%;
      height: 100%;
      position: relative;
    }
    .seat-back {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 20px;
      background: #666;
      border-radius: 5px 5px 0 0;
    }
    .seat-bottom {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 40px;
      background: #888;
      border-radius: 5px;
    }
    .seat.occupied .seat-back,
    .seat.occupied .seat-bottom {
      background: #ff4444;
    }
    .seat:not(.occupied) .seat-back,
    .seat:not(.occupied) .seat-bottom {
      background: #44ff44;
    }
    .status {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      white-space: nowrap;
    }
    input[type="number"] {
      width: 80px;
      padding: 4px;
      margin-left: 8px;
    }
  `]
})
export class DeskComponent implements OnInit {
  seats: Seat[] = [];
  tableWidth = 600;
  tableLength = 400;
  draggedSeat: Seat | null = null;
  lastMouseX = 0;
  lastMouseY = 0;

  ngOnInit() {
    this.initializeSeats();
    this.listenForDrag();
    
    // Listen for iframe messages
    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.seats) {
          this.updateSeatsOccupancy(data.seats);
        }
      } catch (e) {
        console.error('Error processing iframe message:', e);
      }
    });
  }

  initializeSeats() {
    // Initialize with 4 seats in default positions
    const defaultPositions = [
      { x: 50, y: 50 }, { x: 50, y: 290 },
      { x: 490, y: 50 }, { x: 490, y: 290 }
    ];
    
    this.seats = defaultPositions.map((pos, index) => ({
      id: index + 1,
      isOccupied: false,
      position: pos,
      rotation: 0
    }));
  }

  addSeat() {
    const newId = this.seats.length + 1;
    this.seats.push({
      id: newId,
      isOccupied: false,
      position: { x: 100, y: 100 },
      rotation: 0
    });
  }

  updateTable() {
    // Ensure seats stay within bounds after table resize
    this.seats = this.seats.map(seat => ({
      ...seat,
      position: {
        x: Math.min(Math.max(0, seat.position.x), this.tableWidth - 60),
        y: Math.min(Math.max(0, seat.position.y), this.tableLength - 60)
      }
    }));
  }

  startDrag(event: MouseEvent, seat: Seat) {
    if (event.button === 0) { // Left click only
      event.preventDefault();
      this.draggedSeat = seat;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }
  }

  private listenForDrag() {
    document.addEventListener('mousemove', (e) => {
      if (this.draggedSeat) {
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        this.draggedSeat.position.x = Math.min(Math.max(0, this.draggedSeat.position.x + deltaX), this.tableWidth - 60);
        this.draggedSeat.position.y = Math.min(Math.max(0, this.draggedSeat.position.y + deltaY), this.tableLength - 60);
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    document.addEventListener('mouseup', () => {
      this.draggedSeat = null;
    });
  }

  rotateSeat(event: MouseEvent, seat: Seat) {
    event.preventDefault();
    seat.rotation = (seat.rotation + 90) % 360;
  }

  toggleSeat(seatId: number) {
    const seat = this.seats.find(s => s.id === seatId);
    if (seat && !this.draggedSeat) {
      seat.isOccupied = !seat.isOccupied;
    }
  }

  updateSeatsOccupancy(seatData: any[]) {
    this.seats = this.seats.map((seat, index) => ({
      ...seat,
      isOccupied: seatData[index]?.isOccupied ?? seat.isOccupied
    }));
  }
}
