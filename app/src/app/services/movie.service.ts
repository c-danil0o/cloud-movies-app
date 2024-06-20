import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private skipheaders = new HttpHeaders({
    'Content-Type': 'application/json',
    skip: 'true',
  });

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private httpClient: HttpClient) { }

  getUploadUrl(movie: Movie): Observable<any> {
    return this.httpClient.post("https://sxui8pte74.execute-api.eu-central-1.amazonaws.com/upload", movie, {
      headers: this.headers
    })
  }

  getDownloadUrl(): Observable<any> {
    return this.httpClient.get("https://sxui8pte74.execute-api.eu-central-1.amazonaws.com/download/123");
  }

}
