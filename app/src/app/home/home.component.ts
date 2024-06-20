import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MovieService } from '../services/movie.service';

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



  }
}
