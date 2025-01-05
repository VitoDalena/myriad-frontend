import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-index',
  imports:[RouterModule, CommonModule],
  templateUrl: './index.component.html'
})
export class IndexComponent {
  chapters = [
    { id: 0 },
    { id: 1 },
    { id: 2 },
    { id: 3 }
  ];

  // TODO spiegazione gioco
  // TODO aggiunta regole e homebrew attive

  // TODO aggiunta link a breve riassunto globale e trama generale (per nuovi master)
}