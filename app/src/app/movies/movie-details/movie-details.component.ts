import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Movie } from '../../models/movie';

import {MovieService} from "../../services/movie.service";

import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {DialogModule} from "primeng/dialog";
import {RatingModule} from "primeng/rating";
import {InputTextareaModule} from "primeng/inputtextarea";
import {Rating} from "../../models/rating";
import {AuthService} from "../../services/auth.service";
import {UserInfo} from "../../models/UserInfo";
import {Subscription} from "../../models/subscription";

@Component({
  selector: 'app-movie-details',
    standalone: true,
  imports: [ButtonModule, FormsModule, CommonModule, DialogModule, RatingModule, InputTextareaModule],
    templateUrl: './movie-details.component.html',
    styleUrls: ['./movie-details.component.css'],
})
export class MovieDetailsComponent implements OnInit {

    movie!: Movie;
    movieRatingVisible: boolean = false;
    movie_rating_value: number = -1;


    constructor(private route: ActivatedRoute, private movieService: MovieService, private authService: AuthService) { }

    ngOnInit(): void {
      this.route.params.subscribe(params => {
        this.movieService.getMovieById(params['id']).subscribe({
          next: (data) =>{
            console.log(data.Item);
            this.movie = data.Item;
          }
        })
      });
    }

    download(){

    }

    play(){

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

    subscribe(type: string, value: string){
      this.authService.getUserInfo().subscribe({
        next: (data: UserInfo|null) => {
          if (data != null){
            const sub: Subscription = {
              user_id: data.id,
              email: data.email,
              type: type,
              value: value
            }
            this.movieService.subscribe(sub).subscribe({
              next: (data) =>{console.log(data)},
              error: (err) => {console.log(err)}
            })
          }

        },
        error: (err) => console.log(err)
      })
    }

}
