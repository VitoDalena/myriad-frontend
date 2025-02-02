import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ChapterEvent } from '../models/chapter';
import { CommonModule } from '@angular/common';
import { EventSubscriptionService } from '../service/event-subscription.service';
import { SubscriptionFormComponent } from "../subscription-form/subscription-form.component";

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, SubscriptionFormComponent],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.css'
})
export class EventDetailsComponent {
  @Input() event!: ChapterEvent;
  @Output() close = new EventEmitter<void>();

  public showSubscriptionForm = false;

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if(!this.el.nativeElement.contains(event.target)) {
      this.close.emit();
    }
  }
  
  constructor(private el: ElementRef) { }

  linearizeEventTitle(title: string[]) {
    return title.join(' ');
  }

  openSubscriptionForm() {
    this.showSubscriptionForm = true;
  }

  closeSubscriptionForm() {
    this.showSubscriptionForm = false;
  }

  // TODO cornice custom
  // TODO all scrollable
  // TODO auto select text on opening on mobile
}
