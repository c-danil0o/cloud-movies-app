import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Movie } from '../../models/movie';
import { AuthService } from '../../services/auth.service';
import { MovieService } from '../../services/movie.service';
import { SubscriptionAndFeedInfo } from '../../models/subscription_and_feed_info';


@Component({
  selector: 'app-movies-catalog',
  templateUrl: './movies-catalog.component.html',
  styleUrls: ['./movies-catalog.component.css'],
})
export class MoviesCatalogComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private movieService: MovieService,
  ) { }
  movies: Movie[] = [];
  searchText: string = '';
  searchCriteria: { name: string, value: string } | null = null;
  criterias = [
    { name: 'Title', value: 'title' },
    { name: 'Genre', value: 'genre' },
    { name: 'Description', value: 'description' },
    { name: 'Actors', value: 'actor' },
    { name: 'Director', value: 'director' },
    { name: 'Multiparameter', value: 'multiparameter'}
  ];
  role: string = 'none';

  ngOnInit() {
    this.authService.currentRole.subscribe((role) => (this.role = role));
    this.loadMovies();
  }
  addMovie() {
    this.router.navigate(['/add-movie']);
  }

  visibleSearchDialog: boolean = false;

  onSelectionChange(event: any): void {
    if (event.value.value === 'multiparameter') {
      this.visibleSearchDialog = true;
    }
  }

  

  loadMovies() {
    if (this.role == "User") {
      this.authService.getUserInfo().subscribe({
        next: (data) => {
          if (data != null) {
            this.movieService.getPersonalizedFeed(data.id).subscribe({
              next: (data) => {
                console.log(data.Movies)
                this.movies = data.Movies;
              }
            });
          }
        },
        error: (err) => console.log(err),
      });

    } else if (this.role == "Admin") {
      this.movieService.getAllMovies().subscribe({
        next: (data) => {
          console.log(data.Movies);
          this.movies = data.Movies;
        },
      });

    }
  }

  search() {
    console.log(this.searchCriteria?.value)
    console.log(this.searchText)
    if (this.searchCriteria != null && this.searchText != "") {
      this.movieService.search(this.searchCriteria['value'], this.searchText).subscribe({
        next: (results: any) => {
          this.movies = results.Movies;
        }
      });
    }
  }

  msActors: string[] = [];
  msDirectors: string[] = [];

  msgenre: { name: string; code: string } | null = null;
  genres = [
    { name: 'Action', code: 'action' },
    { name: 'Adventure', code: 'adventure' },
    { name: 'History', code: 'history' },
    { name: 'Comedy', code: 'comedy' },
    { name: 'Romance', code: 'romance' },
    { name: 'Western', code: 'western' },
  ];

  mstitle: string = '';
  msdescription: string = '';

  multiParameterSearch(){
    const searchParams = {
      title: this.mstitle,
      genre: this.msgenre ? this.msgenre.name : '',
      description: this.msdescription,
      actors: this.msActors.map(actor => actor.trim()),
      directors: this.msDirectors.map(director => director.trim())
    };

    console.log('Search Parameters:', searchParams);
  }
}
