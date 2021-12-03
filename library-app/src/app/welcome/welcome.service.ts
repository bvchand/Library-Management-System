import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WelcomeService {

  constructor(private http: HttpClient) { }

  saveUser(firstName:string, lastName: string, email: string, address: string): Observable<JSON>{
    return this.http.post<any>(`http://localhost:3000/member/createMember`,{"name":firstName+lastName,
    "address":address,
    "email": email});
  }
}
