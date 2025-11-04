import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'BRL Exchange Rate Dashboard';
}