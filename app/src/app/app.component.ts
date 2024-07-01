import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MoviesModule } from './movies/movies.module';
import { LayoutModule } from './layout/layout.module';
import { Subscription, of } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, MoviesModule, LayoutModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'app';
  role: string = "none";


  constructor(private authService: AuthService) {
  }
  ngOnInit(): void {
    this.authService.currentRole.subscribe((role) => this.role = role)
  }






}
