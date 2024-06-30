import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Movie } from '../../models/movie';

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
  
    constructor(private route: ActivatedRoute) { }
  
    ngOnInit(): void {
      //get from endpoint
      this.route.params.subscribe(params => {
        this.movie = {
          id: params['id'], 
          name: 'Example Movie',
          year: 2023,
          director: 'John Doe',
          duration: 120,
          rating: 4.5,
          fileSize: 2000,
          actors: ['Actor 1', 'Actor 2', 'Actor 3', 'Actor 4', 'Actor 5', 'Actor 6']
        };
      });
    }

    download(){

    }

    play(){
      
    }
}