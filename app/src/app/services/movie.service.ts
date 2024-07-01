import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie';
import { UploadUrl } from '../models/upload_url';

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
    return this.httpClient.post<UploadUrl>("https://sxui8pte74.execute-api.eu-central-1.amazonaws.com/upload", movie, {
      headers: this.headers
    })
  }

  getDownloadUrl(): Observable<any> {
    return this.httpClient.get("https://sxui8pte74.execute-api.eu-central-1.amazonaws.com/download/123");
  }

  uploadMovie(uploadUrl: string, file: File) {
    return this.httpClient.put(uploadUrl, file, { headers: this.skipheaders });
  }

}
