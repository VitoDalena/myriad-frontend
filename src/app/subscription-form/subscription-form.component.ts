import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { EventSubscriptionService } from '../service/event-subscription.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subscription-form',
    imports: [CommonModule, FormsModule],
  templateUrl: './subscription-form.component.html',
  styleUrl: './subscription-form.component.css'
})
export class SubscriptionFormComponent {
  @Input() event: any;
  @Output() close = new EventEmitter<void>();

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if(!this.el.nativeElement.contains(event.target)) {
      this.close.emit();
    }
  }
  
  constructor(private el: ElementRef, private eventSubscriptionService: EventSubscriptionService) { }

  public playerName = '';
  public playerEmail = '';
  public playerPhone = '';

  subscribeToEvent() {
    this.eventSubscriptionService.subscribeToEvent(this.playerName, this.playerEmail, this.playerPhone, this.event.id).subscribe(
      {
        next: () => {
          alert('Iscrizione avvenuta con successo');
          this.close.emit();
        },
        error: () => {}
      }
    );
  }
}

