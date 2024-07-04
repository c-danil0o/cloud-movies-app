import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Movie } from '../../models/movie'
import { AuthService } from "../../services/auth.service";
import { MovieService } from "../../services/movie.service";
import { SubscriptionAndFeedInfo } from "../../models/subscription_and_feed_info";

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
  loadMovies() {
    this.authService.getUserInfo().subscribe({
      next: (data) => {
        if (data != null) {
          // this.movieService.getPersonalizedFeed(data.id).subscribe({
          //   next: (data) =>{
          //     console.log(data.Movies)
          //     this.movies = data.Movies;
          //   }
          this.movieService.getAllMovies().subscribe({
            next: (data) => {
              console.log(data.Movies)
              this.movies = data.Movies;
            }
          })
        }
      },
      error: err => console.log(err)
    })
    // this.movieService.getAllMovies().subscribe({
    //   next: (data) => {
    //     console.log(data.Movies)
    //     this.movies = data.Movies;
    //
    //   },
    //   error: (err) => console.log(err)
    // })
  }

}
