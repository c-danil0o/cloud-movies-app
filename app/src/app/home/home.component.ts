import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MovieService } from '../services/movie.service';
import { Movie } from '../models/movie';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  constructor(private authService: AuthService, private movieService: MovieService) { }
  ngOnInit(): void {

  }

  check() {
    this.movieService.getDownloadUrl().subscribe({
      next: (data) => console.log(data),
      error: (err) => console.log(err)
    })
    let movie = {
      name: "Pulp Fiction",
      year: 1998,
      director: "Quentin Tarantino",
      duration: 2.5,
      rating: 7.9,
      fileSize: 4000,
      actors: ["da"]
    };
    this.movieService.getUploadUrl(movie).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (err) => console.log(err)
    })



  }
}
