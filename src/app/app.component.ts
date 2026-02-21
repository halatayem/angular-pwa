import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BilarService, Bil } from './bilar.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Bil lista';
  cars: Bil[] = [];
  error = '';

  constructor(private bilarService: BilarService) {}

  ngOnInit() {
    this.bilarService.getBilar().subscribe({
      next: (data) => (this.cars = data),
      error: (err) => (this.error = 'Kunde inte hämta bilar')
    });
  }
}
