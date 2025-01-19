import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Componente01Component } from "./componente01/componente01.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Componente01Component],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'controle-financeiro';
}
