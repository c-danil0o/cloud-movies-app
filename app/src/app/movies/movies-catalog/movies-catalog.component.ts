import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Movie } from '../../models/movie'
import { AuthService } from "../../services/auth.service";
import { MovieService } from "../../services/movie.service";

@Component({
  selector: 'app-movies-catalog',
  templateUrl: './movies-catalog.component.html',
  styleUrls: ['./movies-catalog.component.css']
})
export class MoviesCatalogComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService, private movieService: MovieService) { }
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

ngOnInit() {
  this.authService.currentRole.subscribe(role => this.role = role)
  this.loadMovies();
}
addMovie() {
  this.router.navigate(['/add-movie'])
}
loadMovies(){
  this.movieService.getAllMovies().subscribe({
    next: (data) => {
      console.log(data.Movies)
      this.movies = data.Movies;

    },
    error: (err) => console.log(err)
  })
}

}
