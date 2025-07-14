import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventSubscriptionService {

  constructor(private http: HttpClient) { }

  subscribeToEvent(playerName: string, email: string, phone: string, eventId: number) {
    return this.http.post('/api/add-subscription', {
        identifier: eventId, email, name: playerName, phone
    });
  }

  getEvent(eventId: number) {
    return this.http.get('/api/get-event/' + eventId);
  }

}
