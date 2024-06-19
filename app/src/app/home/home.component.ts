import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  constructor(private authService: AuthService) { }
  ngOnInit(): void {
    this.authService.getSession().subscribe({
      next: (session) => console.log(session)
    })

  }

}
