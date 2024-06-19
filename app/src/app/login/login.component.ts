import { Component } from '@angular/core';
import { PasswordModule } from "primeng/password"
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PasswordModule, ButtonModule, FormsModule, InputTextModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string;
  password: string;
  emailRegex: any;
  error: boolean = false;

  constructor(private router: Router) {
    this.email = "";
    this.password = "";
    this.emailRegex = new RegExp(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);


  }
  login(): void {

    console.log('1233')
    if (this.email != "" && this.password != "") {
      if (!this.emailRegex.test(this.email)) {
        this.error = true;
        return;
      }
      this.error = false;


    }

  }


}
