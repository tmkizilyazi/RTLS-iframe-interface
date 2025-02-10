
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Seat {
  id: number;
  isOccupied: boolean;
}

@Component({
  selector: 'app-desk',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="desk-container">
      <div class="desk">
        <div *ngFor="let seat of seats" 
             class="seat" 
             [class.occupied]="seat.isOccupied"
             (click)="toggleSeat(seat.id)">
          Koltuk {{seat.id}}
          <div class="status">{{seat.isOccupied ? 'Dolu' : 'Boş'}}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .desk-container {
      padding: 20px;
    }
    .desk {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      max-width: 600px;
      margin: 0 auto;
    }
    .seat {
      padding: 15px;
      border: 2px solid #ccc;
      border-radius: 5px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
    }
    .seat.occupied {
      background-color: #ff4444;
      color: white;
    }
    .seat:not(.occupied) {
      background-color: #44ff44;
    }
    .status {
      font-size: 0.8em;
      margin-top: 5px;
    }
  `]
})
export class DeskComponent implements OnInit {
  seats: Seat[] = [];

  ngOnInit() {
    // Initialize 6 seats
    this.seats = Array(6).fill(null).map((_, index) => ({
      id: index + 1,
      isOccupied: false
    }));

    // Simulate sensor data with WebSocket or HTTP polling
    setInterval(() => {
      this.updateSeatStatus();
    }, 5000);
  }

  updateSeatStatus() {
    // Simulate random sensor data
    // Replace this with your actual sensor data source
    this.seats = this.seats.map(seat => ({
      ...seat,
      isOccupied: Math.random() > 0.5
    }));
  }

  toggleSeat(seatId: number) {
    const seat = this.seats.find(s => s.id === seatId);
    if (seat) {
      seat.isOccupied = !seat.isOccupied;
    }
  }
}
