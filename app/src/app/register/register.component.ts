import { Component } from '@angular/core';
import { PasswordModule } from "primeng/password"
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext'
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [PasswordModule, ButtonModule, FormsModule, InputTextModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email: string = "";
  password: string = "";
  firstName: string = "";
  lastName: string = "";
  error: any;
  emailRegex: any;

  constructor(private router: Router, private authService: AuthService) {
    this.email = "";
    this.password = "";
    this.emailRegex = new RegExp(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);

  }

  register() {
    if (this.email != "" && this.password != "" && this.firstName != "" && this.lastName != "" && this.emailRegex.test(this.email)) {
      this.error = false;

      this.authService.signUp(this.email, this.password, [
        {
          Name: "given_name",
          Value: this.firstName,
        },
        {
          Name: "family_name",
          Value: this.lastName,
        }]).subscribe({
          next: (data) => {
            console.log(data)
          },
          error: (err) => {
            console.log(err)
          }
        });

    } else {
      this.error = true;
    }


  }
}
