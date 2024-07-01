import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Movie } from '../../models/movie';

import {MovieService} from "../../services/movie.service";
import { DialogModule } from 'primeng/dialog';

import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {FileSaverModule} from 'ngx-filesaver'

import { FileSaverService } from 'ngx-filesaver';
import {RatingModule} from "primeng/rating";
import {InputTextareaModule} from "primeng/inputtextarea";
import {Rating} from "../../models/rating";
import {AuthService} from "../../services/auth.service";
import {UserInfo} from "../../models/UserInfo";


@Component({
  selector: 'app-movie-details',
    standalone: true,
  imports: [ButtonModule, FormsModule, CommonModule, DialogModule, RatingModule, InputTextareaModule, FileSaverModule],
    templateUrl: './movie-details.component.html',
    styleUrls: ['./movie-details.component.css'],
})
export class MovieDetailsComponent implements OnInit {

    movie!: Movie;
    movieId!: string;
    videoUrl!: string;
    visible = false;


    constructor(private route: ActivatedRoute, private movieService: MovieService, private fileSaverService: FileSaverService, private authService: AuthService) { }
    movieRatingVisible: boolean = false;
    movie_rating_value: number = -1;

    ngOnInit(): void {
      this.route.params.subscribe(params => {
        this.movieId = params['id'];
        this.movieService.getMovieById(this.movieId).subscribe({
          next: (data) =>{
            this.movie = data.Item;
          }
        })
      });
    }

    downloadFile(url: string) {
      fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = this.movie.name + ".mp4";
        link.click();
    })
    .catch(error => {
      console.error('Error downloading the file:', error);
    });
    }

    download(){
      this.movieService.getDownloadUrl(this.movieId).subscribe({
        next: (data) =>{
          console.log(data.url);
          this.videoUrl = data.url;
          this.downloadFile(this.videoUrl);
        }
      });
    }

    play(){
      this.visible=true;
      this.movieService.getDownloadUrl(this.movieId).subscribe({
        next: (data) =>{
          this.videoUrl = data.url;
        }
      });
    }

    showRateDialog(){
      this.movieRatingVisible = true;
    }

    addMovieRate(movie_id: string | undefined){
      if(this.movie_rating_value == -1)
        return

      this.authService.getUserInfo().subscribe({
        next: (data: UserInfo|null) => {
          if (data != null){
            const rating: Rating = {
              user: data.id,
              email: data.email,
              movie_id: movie_id as string,
              grade: this.movie_rating_value
            }
            this.movieService.rateMovie(rating).subscribe({
              next: (data) =>{console.log(data)},
              error: (err) => {console.log(err)}
            })
            this.movieRatingVisible = false;
            this.movie_rating_value = -1
          }

        },
        error: (err) => console.log(err)
      })
    }

  protected readonly Math = Math;
}
