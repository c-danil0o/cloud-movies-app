import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {SelectButtonModule} from 'primeng/selectbutton';
import {DropdownModule} from 'primeng/dropdown';
import {FileSelectEvent, FileUploadModule} from 'primeng/fileupload';
import {ChipsModule} from 'primeng/chips';
import {MessageService} from 'primeng/api';
import {Movie} from '../../models/movie';
import {MovieService} from '../../services/movie.service';
import {UploadUrl} from '../../models/upload_url';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {Router} from '@angular/router';

@Component({
  selector: 'app-add-movie',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    SelectButtonModule,
    DropdownModule,
    FileUploadModule,
    ProgressSpinnerModule,
    ChipsModule
  ],
  templateUrl: './add-movie.component.html',
  styleUrl: './add-movie.component.css',
})
export class AddMovieComponent {
  constructor(
    private router: Router,
    private messageService: MessageService,
    private movieService: MovieService,
  ) {
  }

  thumbnailSelected($event: FileSelectEvent) {
    this.toBase64($event.files[0]).then((result) => (this.thumbnail = result));
  }

  movieSelected($event: FileSelectEvent) {
    this.fileSize = $event.files[0].size;
    this.movie = $event.files[0];
    console.log($event.files[0]);
  }

  options: any[] = [
    {label: 'Movie', value: 'movie'},
    {label: 'Series', value: 'series'},
  ];
  selectedOption: string = 'movie';

  uploading: boolean = false;
  movieName: string = '';
  year: string = '';
  directors: string[] = [];
  genre: { name: string; code: string } | null = null;
  genres = [
    {name: 'Action', code: 'action'},
    {name: 'Adventure', code: 'adventure'},
    {name: 'History', code: 'history'},
    {name: 'Comedy', code: 'comedy'},
    {name: 'Romance', code: 'romance'},
    {name: 'Western', code: 'western'},
  ];
  description: string = '';
  actors: string[] = [];
  rating: string = '';
  episode_number: string = '';
  duration: string = '';
  thumbnail: any;
  movie: File | null = null;
  fileSize: number = 0;

  done() {
    if (
      this.movieName != '' &&
      !isNaN(Number(this.year)) &&
      this.directors.length > 0 &&
      this.genre != null &&
      this.description != '' &&
      this.actors.length > 0 &&
      !isNaN(Number(this.rating)) &&
      !isNaN(Number(this.duration)) &&
      this.movie != null
    ) {
      if (
        (this.selectedOption == 'series' &&
          isNaN(Number(this.episode_number)) && Number(this.episode_number) < 1) ||
        Number(this.year) < 1800 ||
        Number(this.year) > 2030 ||
        Number(this.rating) <= 0.0 ||
        Number(this.rating) > 10.0
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid data',
          key: 'bc',
          detail: 'Please enter valid data!',
          life: 2000,
        });
        return;
      }
      let ep = -1;
      if (this.selectedOption == 'series') {
        ep = Number(this.episode_number);
      }

      let movie: Movie = {
        upload_status: 'transcoding',
        name: this.movieName,
        description: this.description,
        episode_number: ep,
        year: Number(this.year),
        genre: this.genre['code'],
        directors: this.directors.map(director => director.trim()),
        duration: Number(this.duration),
        rating: Number(this.rating),
        fileSize: this.fileSize,
        actors: this.actors.map(actor => actor.trim()),
        thumbnail: this.thumbnail,
        created_at: new Date().valueOf(),
        modified_at: this.movie?.lastModified || 0,
        search_field:
          this.movieName +
          '%' +
          this.description +
          '%' +
          this.actors.join(',') +
          '%' +
          this.directors.join(',') +
          '%' +
          this.genre['code'],
      };
      this.movieService.getUploadUrl(movie).subscribe({
        next: (data: UploadUrl) => {
          console.log(data);
          if (this.movie != null) {
            this.uploading = true;

            this.movieService.uploadMovie(data.Url, this.movie).subscribe({
              next: (result) => {
                console.log(result);
                this.messageService.add({
                  severity: 'success',
                  summary: 'Upload finished',
                  key: 'bc',
                  detail: 'Movie uploaded successfully!',
                  life: 2000,
                });
                this.uploading = false;
                this.router.navigate(['/catalog']);
              },

              error: (err) => {
                console.log(err);
                this.showError();
              },
            });
          }
        },
        error: (err) => {
          console.log(err);
          this.showError();
        },
      });
    }
  }

  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Upload failed!',
      key: 'bc',
      detail: 'Server error!',
      life: 2000,
    });
  }

  toBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
}
