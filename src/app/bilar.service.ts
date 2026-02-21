import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Bil {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class BilarService {
  private apiUrl = '/bilar';

  constructor(private http: HttpClient) {}

  getBilar(): Observable<Bil[]> {
    return this.http.get<Bil[]>(this.apiUrl);
  }
}
