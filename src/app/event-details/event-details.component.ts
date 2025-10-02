import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
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
export class EventDetailsComponent implements OnInit {
  @Input() event!: ChapterEvent;
  @Output() close = new EventEmitter<void>();
  
  public showSubscriptionForm = false;
  public subscribers: string[] = [];
  public isMobile = window.innerWidth < 768;

  constructor(
    private el: ElementRef, 
    private eventSubscriptionService: EventSubscriptionService
  ) { }

  // Gestione click fuori dal modale
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // Solo su desktop - su mobile usiamo gesture
    if (!this.isMobile && !this.el.nativeElement.contains(event.target)) {
      this.close.emit();
    }
  }

  // Gestione tocco fuori dal modale (mobile)
  @HostListener('document:touchstart', ['$event'])
  touchout(event: any) {
    if (this.isMobile) {
      const modalElement = this.el.nativeElement.querySelector('.event-details');
      if (modalElement && !modalElement.contains(event.target)) {
        this.close.emit();
      }
    }
  }

  // Chiudi con tasto ESC
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    this.close.emit();
  }

  // Chiudi con tasto pulsante indietro sulla freccia mobile
  @HostListener('window:popstate', ['$event'])
  onBackButton(event: any) {
    if (this.isMobile) {
      this.close.emit();
      event.preventDefault();
      event.stopPropagation();
    }
  }

  // Previeni scroll della pagina sottostante su mobile
  @HostListener('touchmove', ['$event'])
  onTouchMove(event: any) {
    const target = event.target;
    const scrollContainer = this.el.nativeElement.querySelector('.event-details > div:last-of-type');
    
    // Permetti scroll solo dentro il contenitore
    if (!scrollContainer?.contains(target)) {
      event.preventDefault();
    }
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 768;
    this.loadEvent();
    
    // Blocca scroll del body quando il modale è aperto
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    // Ripristina scroll quando il modale viene chiuso
    document.body.style.overflow = '';
  }

  loadEvent() {
    this.eventSubscriptionService.getEvent(this.event.id).subscribe({
      next: (data) => {
        if (!this.event.done) {
          this.subscribers = (data as any).subscribers.map((s: any) => s.nome);
        } else {
          this.subscribers = this.event.players || [];
        }
      },
      error: () => {
        // Fallback ai giocatori dell'evento se il servizio fallisce
        this.subscribers = this.event.players || [];
      }
    });
  }

  linearizeEventTitle(title: string[]) {
    return title.join(' ');
  }

  openSubscriptionForm() {
    this.showSubscriptionForm = true;
  }

  closeSubscriptionForm() {
    this.loadEvent();
    this.showSubscriptionForm = false;
  }
}