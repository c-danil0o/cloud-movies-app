import { Component } from '@angular/core';
import { Movie } from '../../models/movie'
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movies-catalog',
  templateUrl: './movies-catalog.component.html',
  styleUrls: ['./movies-catalog.component.css']
})
export class MoviesCatalogComponent {

  movies: Movie[] = []
  searchText: string = '';
  searchCriteria: string = '';
  criterias = [
    { name: 'Title', value: 'title' },
    { name: 'Genre', value: 'genre' },
    { name: 'Description', value: 'description' },
    { name: 'Actors', value: 'actors' },
    { name: 'Director', value: 'director' }
  ];
  role: string = "none";
  constructor(private router: Router, private authService: AuthService) {
  }

  ngOnInit() {
    this.authService.currentRole.subscribe(role => this.role = role)
    this.loadMovies();
  }
  addMovie() {
    this.router.navigate(['/add-movie'])
  }

  loadMovies() {
    // this.movies = [
    //   { id: 'id1', name: 'Movie 1', year: 2020, director: 'Director 1', duration: 120, rating: 4.5, fileSize: 1500, actors: ['Actor 1', 'Actor 2'] },
    //   { id: 'id2', name: 'Movie 2', year: 2021, director: 'Director 2', duration: 110, rating: 4.2, fileSize: 1400, actors: ['Actor 3', 'Actor 4'] },
    //   { id: 'id3', name: 'Movie 3', year: 2022, director: 'Director 3', duration: 130, rating: 4.7, fileSize: 1600, actors: ['Actor 5', 'Actor 6'] },
    //   { id: 'id4', name: 'Movie 1', year: 2020, director: 'Director 1', duration: 120, rating: 4.5, fileSize: 1500, actors: ['Actor 1', 'Actor 2'] },
    //   { id: 'id', name: 'Movie 2', year: 2021, director: 'Director 2', duration: 110, rating: 4.2, fileSize: 1400, actors: ['Actor 3', 'Actor 4'] },
    //   { id: 'id', name: 'Movie 3', year: 2022, director: 'Director 3', duration: 130, rating: 4.7, fileSize: 1600, actors: ['Actor 5', 'Actor 6'] },
    //   { id: 'id', name: 'Movie 1', year: 2020, director: 'Director 1', duration: 120, rating: 4.5, fileSize: 1500, actors: ['Actor 1', 'Actor 2'] },
    //   { id: 'id', name: 'Movie 2', year: 2021, director: 'Director 2', duration: 110, rating: 4.2, fileSize: 1400, actors: ['Actor 3', 'Actor 4'] },
    //   { id: 'id', name: 'Movie 3', year: 2022, director: 'Director 3', duration: 130, rating: 4.7, fileSize: 1600, actors: ['Actor 5', 'Actor 6'] },
    //   { id: 'id', name: 'Movie 1', year: 2020, director: 'Director 1', duration: 120, rating: 4.5, fileSize: 1500, actors: ['Actor 1', 'Actor 2'] },
    //   { id: 'id', name: 'Movie 2', year: 2021, director: 'Director 2', duration: 110, rating: 4.2, fileSize: 1400, actors: ['Actor 3', 'Actor 4'] },
    //   { id: 'id', name: 'Movie 3', year: 2022, director: 'Director 3', duration: 130, rating: 4.7, fileSize: 1600, actors: ['Actor 5', 'Actor 6'] },
    //   { id: 'id', name: 'Movie 1', year: 2020, director: 'Director 1', duration: 120, rating: 4.5, fileSize: 1500, actors: ['Actor 1', 'Actor 2'] },
    //   { id: 'id', name: 'Movie 2', year: 2021, director: 'Director 2', duration: 110, rating: 4.2, fileSize: 1400, actors: ['Actor 3', 'Actor 4'] },
    //   { id: 'id', name: 'Movie 3', year: 2022, director: 'Director 3', duration: 130, rating: 4.7, fileSize: 1600, actors: ['Actor 5', 'Actor 6'] },
    //   { id: 'id', name: 'Movie 1', year: 2020, director: 'Director 1', duration: 120, rating: 4.5, fileSize: 1500, actors: ['Actor 1', 'Actor 2'] },
    //   { id: 'id', name: 'Movie 2', year: 2021, director: 'Director 2', duration: 110, rating: 4.2, fileSize: 1400, actors: ['Actor 3', 'Actor 4'] },
    //   { id: 'id', name: 'Movie 3', year: 2022, director: 'Director 3', duration: 130, rating: 4.7, fileSize: 1600, actors: ['Actor 5', 'Actor 6'] },
    //   { id: 'id', name: 'Movie 1', year: 2020, director: 'Director 1', duration: 120, rating: 4.5, fileSize: 1500, actors: ['Actor 1', 'Actor 2'] },
    //   { id: 'id', name: 'Movie 2', year: 2021, director: 'Director 2', duration: 110, rating: 4.2, fileSize: 1400, actors: ['Actor 3', 'Actor 4'] },
    //   { id: 'id', name: 'Movie 3', year: 2022, director: 'Director 3', duration: 130, rating: 4.7, fileSize: 1600, actors: ['Actor 5', 'Actor 6'] },
    //   { id: 'id', name: 'Movie 1', year: 2020, director: 'Director 1', duration: 120, rating: 4.5, fileSize: 1500, actors: ['Actor 1', 'Actor 2'] },
    //   { id: 'id', name: 'Movie 2', year: 2021, director: 'Director 2', duration: 110, rating: 4.2, fileSize: 1400, actors: ['Actor 3', 'Actor 4'] },
    //   { id: 'id', name: 'Movie 3', year: 2022, director: 'Director 3', duration: 130, rating: 4.7, fileSize: 1600, actors: ['Actor 5', 'Actor 6'] },
    //   { id: 'id', name: 'Movie 1', year: 2020, director: 'Director 1', duration: 120, rating: 4.5, fileSize: 1500, actors: ['Actor 1', 'Actor 2'] },
    //   { id: 'id', name: 'Movie 2', year: 2021, director: 'Director 2', duration: 110, rating: 4.2, fileSize: 1400, actors: ['Actor 3', 'Actor 4'] },
    //   { id: 'id', name: 'Movie 3', year: 2022, director: 'Director 3', duration: 130, rating: 4.7, fileSize: 1600, actors: ['Actor 5', 'Actor 6'] },
    //   { id: 'id', name: 'Movie 1', year: 2020, director: 'Director 1', duration: 120, rating: 4.5, fileSize: 1500, actors: ['Actor 1', 'Actor 2'] },
    //   { id: 'id', name: 'Movie 2', year: 2021, director: 'Director 2', duration: 110, rating: 4.2, fileSize: 1400, actors: ['Actor 3', 'Actor 4'] },
    //   { id: 'id', name: 'Movie 3', year: 2022, director: 'Director 3', duration: 130, rating: 4.7, fileSize: 1600, actors: ['Actor 5', 'Actor 6'] },
    // ];
  }

}
