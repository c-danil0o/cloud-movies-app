import {Component, OnInit} from '@angular/core';
import {TabViewModule} from "primeng/tabview";
import {AuthService} from "../services/auth.service";
import {MovieService} from "../services/movie.service";
import {MessageService} from "primeng/api";
import {NgForOf} from "@angular/common";
import {Button} from "primeng/button";
import {unsubscribe} from "node:diagnostics_channel";
import {UserSubscriptions} from "../models/user-subscriptions";
import {Subscription} from "../models/subscription";

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    TabViewModule,
    NgForOf,
    Button
  ],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export class SubscriptionsComponent implements OnInit {
  genres: string[] = [];
  actors: string[] = [];
  directors: string[] = [];
  user_subscriptions: UserSubscriptions = {
    user_id: "a",
    genres: [],
    actors: [],
    directors: []
  };

  constructor(private authService: AuthService, private messageService: MessageService , private movieService : MovieService) {}

  ngOnInit() {
    this.genres = ['action', 'comedy'];
    this.actors = ['John Travolta', 'Samuel L Jackson', 'Uma Thurman']
    this.directors = ["Quentin Tarantino", "Martin Scorsese"]
    this.authService.getUserInfo().subscribe({
      next: (info) => {
        if (info!=null){
          this.movieService.getSubscriptions(info.id).subscribe({
            next: (data) => {
              if (data != null){
                this.user_subscriptions = data.Subscriptions;
                console.log(this.user_subscriptions);
              }
            }
          })
        }
      }
    })
  }


  unsubscribe(type: string, value: string){
    this.authService.getUserInfo().subscribe({
      next: (data) => {
        if (data != null){
          const unsub: Subscription = {
            user_id: data.id,
            email: data.email,
            type: type,
            value: value
          };
          this.movieService.unsubscribe(unsub).subscribe({
            next: (data) =>{
              this.user_subscriptions = data.Subscriptions;
              console.log(data.Subscriptions);
            },
            error: err => console.log(err)
          })

        }
      },
      error: err => console.log(err)
    })
  }
}
