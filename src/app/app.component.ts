import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'vaitoverse-portal';
  constructor(private meta: Meta) { 
    this.meta.addTag({ name: 'content', content: 'width=device-width,height=device-height initial-scale=1' });
   }
}
