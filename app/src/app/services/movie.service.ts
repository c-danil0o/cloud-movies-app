import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie';
import { UploadUrl } from '../models/upload_url';
import { Rating } from "../models/rating";
import { Subscription } from "../models/subscription";
import { environment } from '../../env';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private skipheaders = new HttpHeaders({
    skip: 'true',
  });

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private httpClient: HttpClient) { }

  getUploadUrl(movie: Movie): Observable<UploadUrl> {
    return this.httpClient.post<UploadUrl>(environment.apiGateway + "upload", movie, {
      headers: this.headers
    })
  }

  getDownloadUrl(id: string): Observable<any> {
    return this.httpClient.get(environment.apiGateway + "download/" + id);
  }

  uploadMovie(uploadUrl: string, file: File) {
    return this.httpClient.put(uploadUrl, file, { headers: this.skipheaders });
  }

  getAllMovies(): Observable<any> {
    return this.httpClient.get(environment.apiGateway + "all")
  }

  getMovieById(id: string): Observable<any> {
    return this.httpClient.get(environment.apiGateway + "movie/" + id)
  }

  rateMovie(rating: Rating): Observable<any> {
    return this.httpClient.post(environment.apiGateway + "rate", rating, {
      headers: this.headers
    });
  }

  subscribe(sub: Subscription): Observable<any> {
    return this.httpClient.post(environment.apiGateway + "subscribe", sub, {
      headers: this.headers
    });
  }

  getSubscriptions(user_id: string): Observable<any> {
    return this.httpClient.get(environment.apiGateway + "subscriptions/" + user_id);
  }

  unsubscribe(sub: Subscription): Observable<any> {
    return this.httpClient.post(environment.apiGateway + "unsubscribe", sub, {
      headers: this.headers
    });
  }

}
