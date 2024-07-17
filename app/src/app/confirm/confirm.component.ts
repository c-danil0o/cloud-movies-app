import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext'
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [ButtonModule, FormsModule, RouterModule, InputTextModule],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.css'
})
export class ConfirmComponent implements OnInit {
  email: string = "";
  code: string = "";
  constructor(private router: Router, private authService: AuthService, private route: ActivatedRoute, private messageService: MessageService) {

  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.email = params['email'];
    })

  }
  confirm() {
    if (this.code != "") {
      this.authService.confirmSignUp(this.email, this.code).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            key: 'bc',
            detail: 'You can login now!',
            life: 2000
          })
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            key: 'bc',
            detail: 'Email confirmation failed!',
            life: 2000
          })
          console.log(err)
        }
      })
    }
  }
  resend() {
    this.authService.resendConfirmationCode(this.email).subscribe({
      next: (data) => {
        console.log(data)
        this.messageService.add({
          severity: 'success',
          summary: 'Email sent!',
          key: 'bc',
          detail: 'Please check your inbox!',
          life: 2000
        })
      },
      error: (err) => {
        console.log(err)
        this.messageService.add({
          severity: 'error',
          summary: 'Error!',
          key: 'bc',
          detail: 'Error sending email!',
          life: 2000
        })
      }
    })
  }


}
