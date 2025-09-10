import { AfterViewChecked, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { EventSubscriptionService } from '../service/event-subscription.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subscription-form',
    imports: [CommonModule, FormsModule],
  templateUrl: './subscription-form.component.html',
  styleUrl: './subscription-form.component.css'
})
export class SubscriptionFormComponent implements AfterViewChecked {
  @Input() event: any;
  @Output() close = new EventEmitter<void>();

  firstLoad = true

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if(!this.el.nativeElement.contains(event.target)) {
      this.close.emit();
    }
  }

  @ViewChild('name')
  nameInput!: ElementRef<HTMLInputElement>;
  
  constructor(private el: ElementRef, private eventSubscriptionService: EventSubscriptionService) { }
  ngAfterViewChecked(): void {
    if(this.firstLoad) {
      this.nameInput.nativeElement.focus();
      
      this.firstLoad = false;
      return;
    }
  }

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

