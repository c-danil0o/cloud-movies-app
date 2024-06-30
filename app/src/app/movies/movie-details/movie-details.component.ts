import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Movie } from '../../models/movie';

import {MovieService} from "../../services/movie.service";

import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-movie-details',
    standalone: true,
    imports : [ButtonModule, FormsModule, CommonModule],
    templateUrl: './movie-details.component.html',
    styleUrls: ['./movie-details.component.css'],
})
export class MovieDetailsComponent implements OnInit {

    movie!: Movie;
    actors!: string;
    

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
}
