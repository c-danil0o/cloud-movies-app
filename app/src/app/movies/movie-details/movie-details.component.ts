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

@Component({
  selector: 'app-movie-details',
    standalone: true,
  imports: [ButtonModule, FormsModule, CommonModule, DialogModule, RatingModule, InputTextareaModule],
    templateUrl: './movie-details.component.html',
    styleUrls: ['./movie-details.component.css'],
})
export class MovieDetailsComponent implements OnInit {

    movie!: Movie;
    actors!: string;
    movieRatingVisible: boolean = false;
    movie_rating_value: number = -1;


    constructor(private route: ActivatedRoute, private movieService: MovieService) { }

    ngOnInit(): void {
      this.route.params.subscribe(params => {
        this.movieService.getMovieById(params['id']).subscribe({
          next: (data) =>{
            this.movie = data.Item;
            this.actors = data.Item.actors;
            this.movie.actors = this.actors.split(",");
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
      const rating: Rating = {
        user: "b3941822-1091-7039-6a6a-346cb880af6a",
        movie_id:  movie_id as string,
        grade: this.movie_rating_value
      }
      this.movieService.rateMovie(rating).subscribe({
        next: (data) =>{console.log(data)},
        error: (err) => {console.log(err)}
      })
      this.movieRatingVisible = false;
      this.movie_rating_value = -1
    }
}
