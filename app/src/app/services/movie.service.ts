import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, Subscriber} from 'rxjs';
import { Movie } from '../models/movie';
import { UploadUrl } from '../models/upload_url';
import { Rating } from "../models/rating";
import {SubscriptionAndFeedInfo} from "../models/subscription_and_feed_info";
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

  getDownloadUrl(id: string, info: SubscriptionAndFeedInfo): Observable<any> {
    return this.httpClient.post(environment.apiGateway + "download/" + id, info, {
      headers: this.headers
    });
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

  subscribe(sub: SubscriptionAndFeedInfo): Observable<any> {
    return this.httpClient.post(environment.apiGateway + "subscribe", sub, {
      headers: this.headers
    });
  }

  getSubscriptions(user_id: string): Observable<any> {
    return this.httpClient.get(environment.apiGateway + "subscriptions/" + user_id);
  }

  unsubscribe(sub: SubscriptionAndFeedInfo): Observable<any> {
    return this.httpClient.post(environment.apiGateway + "unsubscribe", sub, {
      headers: this.headers
    });
  }

  getPersonalizedFeed(user_id: string): Observable<any> {
    return this.httpClient.get(environment.apiGateway + "feed/" + user_id)
  }

  getMovieRate(user_id:string, movie_id:string): Observable<any>{
    let params = new HttpParams();
    params = params.append('user_id', user_id);
    params = params.append('movie_id', movie_id);
    return this.httpClient.get(environment.apiGateway + "rating", {params: params})
  }

}
