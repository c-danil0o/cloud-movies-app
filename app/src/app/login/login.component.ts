import { Component } from '@angular/core';
import { PasswordModule } from "primeng/password"
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PasswordModule, ButtonModule, FormsModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string;
  password: string;

  constructor(private router: Router) {
    this.email = "";
    this.password = "";

  }
  login(): void {
    // if (this.email == "admin" && this.password == "admin"){
    // localStorage.setItem('user', 'admin');
    // this.authService.setUser("admin")
    // this.router.navigate(['/certificates'])
    // }
  }

}
