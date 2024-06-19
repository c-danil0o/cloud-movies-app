import { Component } from '@angular/core';
import { PasswordModule } from "primeng/password"
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext'

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [PasswordModule, ButtonModule, FormsModule, InputTextModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email: string;
  password: string;

  constructor(private router: Router) {
    this.email = "";
    this.password = "";

  }

  login() {

  }
}
