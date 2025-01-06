import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { routeTransitions } from '../route-transitions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [routeTransitions]
})
export class AppComponent {
  title = 'vaitoverse-portal';
  constructor(private meta: Meta, protected router: ActivatedRoute) {
    
    this.meta.addTag({ name: 'content', content: 'width=device-width,height=device-height initial-scale=1' });


   }
}
