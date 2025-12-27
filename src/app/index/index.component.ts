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
    { id: '1-b'}
  ];

  scroll(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth'});
}
}