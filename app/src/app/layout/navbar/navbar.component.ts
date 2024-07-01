import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  logout() {
    this.authService.logout()
    this.router.navigate(['/login'])
  }
  constructor(private router: Router, private authService: AuthService) {
  }
}
