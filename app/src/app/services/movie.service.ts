import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    skip: 'true',
  });

  constructor(private httpClient: HttpClient) { }

  // getUploadUrl():Observable<any>{
  //   return this.httpClient.post()
  // }

  getDownloadUrl(): Observable<any> {
    return this.httpClient.get("https://fjxhng9ezd.execute-api.eu-central-1.amazonaws.com/test");
  }

}
