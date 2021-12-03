import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { books } from './book.component';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(private http: HttpClient) { }

  public getAllBooks(): Observable<books[]>{
    return this.http.get<any>(`http://10.0.0.192:3000/book/getAllBooks`);
  }

  public getUserHistory(email: string): Observable<JSON[]>{
    return this.http.post<any>(`http://10.0.0.192:3000/book/getMemberHistory`,{"email": email});
  }

  public getBook(email: string, title: string): Observable<JSON[]>{
    return this.http.post<any>(`http://10.0.0.192:3000/book/issue`,{
    "title":title,
    "email": email});
  }

  public returnBook(email: string, title: string): Observable<JSON[]>{
    return this.http.post<any>(`http://10.0.0.192:3000/book/returnBook`,{
    "title":title,
    "email": email});
  }
}
