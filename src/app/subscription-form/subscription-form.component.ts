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
  
  @ViewChild('name') nameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') emailInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('phoneInput') phoneInputRef!: ElementRef<HTMLInputElement>;
  
  firstLoad = true;
  isMobile = window.innerWidth < 768;
  
  public playerName = '';
  public playerEmail = '';
  public playerPhone = '';
  public showErrors = false;
  public isLoading = false;

  constructor(
    private el: ElementRef, 
    private eventSubscriptionService: EventSubscriptionService
  ) { }

  // Gestione click fuori dal form
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.isMobile && !this.el.nativeElement.contains(event.target)) {
      this.closeForm();
    }
  }

  // Gestione tocco fuori dal form (mobile)
  @HostListener('document:touchstart', ['$event'])
  touchout(event: any) {
    if (this.isMobile) {
      const formElement = this.el.nativeElement.querySelector('.subscription-form');
      if (formElement && !formElement.contains(event.target)) {
        this.closeForm();
      }
    }
  }

  // Chiudi con ESC
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    this.closeForm();
  }

  // Previeni scroll sottostante
  @HostListener('touchmove', ['$event'])
  onTouchMove(event: any) {
    event.preventDefault();
  }

  ngAfterViewChecked(): void {
    if (this.firstLoad && this.nameInput) {
      // Piccolo delay per iOS
      setTimeout(() => {
        this.nameInput.nativeElement.focus();
      }, 100);
      this.firstLoad = false;
      
      // Blocca scroll body
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy(): void {
    // Ripristina scroll
    document.body.style.overflow = '';
  }

  // Validazione email
  isValidEmail(): boolean {
    if (!this.playerEmail) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.playerEmail);
  }

  // Focus sul campo successivo
  focusNext(nextInput: ElementRef<HTMLInputElement>): void {
    if (nextInput && nextInput.nativeElement) {
      nextInput.nativeElement.focus();
    }
  }

  // Validazione form
  validateForm(): boolean {
    this.showErrors = true;
    
    if (!this.playerName.trim()) {
      this.nameInput.nativeElement.focus();
      return false;
    }
    
    if (!this.isValidEmail()) {
      this.emailInputRef.nativeElement.focus();
      return false;
    }
    
    return true;
  }

  subscribeToEvent() {
    if (this.isLoading) return;
    
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    this.eventSubscriptionService.subscribeToEvent(
      this.playerName.trim(), 
      this.playerEmail.trim(), 
      this.playerPhone.trim(), 
      this.event.id
    ).subscribe({
      next: () => {
        this.isLoading = false;
        // Messaggio di successo più elegante
        this.showSuccessMessage();
        setTimeout(() => {
          this.close.emit();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        alert('Errore durante l\'iscrizione. Riprova più tardi.');
        console.error('Subscription error:', error);
      }
    });
  }

  showSuccessMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #27ae60, #2ecc71);
      color: white;
      padding: 1.5rem 2rem;
      border-radius: 12px;
      font-weight: bold;
      font-size: 1.1rem;
      z-index: 10001;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      animation: successPop 0.3s ease-out;
    `;
    message.textContent = '✓ Iscrizione completata!';
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes successPop {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
      style.remove();
    }, 1500);
  }

  closeForm() {
    if (!this.isLoading) {
      this.close.emit();
    }
  }
}