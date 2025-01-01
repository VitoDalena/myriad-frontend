import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ChapterEvent } from '../models/chapter';

@Component({
  selector: 'app-event-details',
  imports: [],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.css'
})
export class EventDetailsComponent {
  @Input() event!: ChapterEvent;
  @Output() close = new EventEmitter<void>();

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if(!this.el.nativeElement.contains(event.target)) {
      this.close.emit();
    }
  }
  
  constructor(private el: ElementRef) { }
}
