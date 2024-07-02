import {Component, OnInit} from '@angular/core';
import {TabViewModule} from "primeng/tabview";
import {AuthService} from "../services/auth.service";
import {MovieService} from "../services/movie.service";
import {MessageService} from "primeng/api";
import {NgForOf} from "@angular/common";
import {Button} from "primeng/button";
import {unsubscribe} from "node:diagnostics_channel";

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

  constructor(private authService: AuthService, private messageService: MessageService , private movieService : MovieService) {}

  ngOnInit() {
    this.genres = ['action', 'comedy'];
    this.actors = ['John Travolta', 'Samuel L Jackson', 'Uma Thurman']
    this.directors = ["Quentin Tarantino", "Martin Scorsese"]



  }


  unsubscribe(){

  }
}
