import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from "primeng/selectbutton";
import { DropdownModule } from 'primeng/dropdown';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { Movie } from '../../models/movie';
import { MovieService } from '../../services/movie.service';
import { UploadUrl } from '../../models/upload_url';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-movie',
  standalone: true,
  imports: [FormsModule, InputTextModule, SelectButtonModule, DropdownModule, ProgressSpinnerModule, FileUploadModule],
  templateUrl: './edit-movie.component.html',
  styleUrl: './edit-movie.component.css'
})
export class EditMovieComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private messageService: MessageService, private movieService: MovieService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.movieId = params['id'];
      this.movieService.getMovieById(this.movieId).subscribe({
        next: (data: any) => {
          this.loadData(data.Item)
        }
      })
    })
  }

  loadData(data: Movie) {
    if (data) {
      console.log(data)
      this.movieName = data.name;
      this.year = String(data.year);
      this.director = data.director;
      this.genre = { name: data.genre.at(0)?.toUpperCase() + data.genre.substring(1), code: data.genre };
      this.description = data.description;
      if (data.episode_number != -1) {
        this.selectedOption = "series";
        this.episode_number = String(data.episode_number);
      } else {
        this.selectedOption = "movie";
        this.episode_number = "-1"
      }
      this.actors = data.actors.join(",");
      this.rating = String(data.rating);
      this.duration = String(data.duration);
      this.upload_status = data.upload_status;
      this.fileSize = data.fileSize
      this.created_at = data.created_at;
      this.modified_at = data.modified_at;
      this.thumbnail = data.thumbnail;
    }

  }
  thumbnailSelected($event: FileSelectEvent) {
    this.toBase64($event.files[0]).then((result) => this.new_thumbnail = result)
  }
  movieSelected($event: FileSelectEvent) {
    this.fileSize = $event.files[0].size
    this.movie = $event.files[0]
    console.log($event.files[0])
  }

  options: any[] = [{ label: 'Movie', value: 'movie' }, { label: 'Series', value: 'series' }];
  selectedOption: string = 'movie';

  movieId: string = "";
  uploading: boolean = false;
  upload_status: string = "";
  movieName: string = "";
  year: string = "";
  director: string = " ";
  genre: { name: string, code: string } | null = null;
  genres = [
    { name: 'Action', code: 'action' },
    { name: 'Adventure', code: 'adventure' },
    { name: 'History', code: 'history' }, { name: 'Comedy', code: 'comedy' },
    { name: 'Romance', code: 'romance' },
    { name: 'Western', code: 'western' }
  ];
  description: string = "";
  actors: string = "";
  rating: string = "";
  episode_number: string = "";
  created_at: number = 0;
  modified_at: number = 0;
  duration: string = "";
  thumbnail: any
  new_thumbnail: any = ""
  movie: File | null = null
  fileSize: number = 0

  done() {
    if (this.movieName != "" && !isNaN(Number(this.year)) && this.director != "" && this.genre != null && this.description != "" && this.actors != "" && !isNaN(Number(this.rating)) && !isNaN(Number(this.duration))) {
      if ((this.selectedOption == "series" && isNaN(Number(this.episode_number))) || Number(this.year) < 1800 || Number(this.year) > 2030 || Number(this.rating) <= 0.0 || Number(this.rating) > 10.0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid data',
          key: 'bc',
          detail: 'Please enter valid data!',
          life: 2000
        })
        return;
      }
      let ep = -1
      if (this.selectedOption == "series") {
        ep = Number(this.episode_number)
      }

      let movie: Movie = {
        id: this.movieId,
        upload_status: this.upload_status,
        name: this.movieName,
        description: this.description,
        episode_number: ep,
        year: Number(this.year),
        genre: this.genre['code'],
        director: this.director,
        duration: Number(this.duration),
        rating: Number(this.rating),
        fileSize: this.fileSize,
        actors: this.actors.split(","),
        thumbnail: this.thumbnail,
        created_at: this.created_at,
        modified_at: this.modified_at,
        search_field: this.movieName + "%" + this.description + "%" + this.actors + "%" + this.director + "%" + this.genre['code']
      }
      // uploading new thumbnail
      if (this.new_thumbnail != "") {
        movie.thumbnail = this.new_thumbnail;
      }
      // uploading new file
      if (this.movie != null) {
        movie.upload_status = "transcoding";
        movie.created_at = new Date().valueOf();
        movie.modified_at = this.movie?.lastModified || 0;
        movie.fileSize = this.movie.size;

        this.movieService.deleteMovieById(this.movieId, "table-file").subscribe({
          next: (res) => {
            console.log("deleted movie")
            this.movieService.getUploadUrl(movie).subscribe({
              next: (data: UploadUrl) => {
                console.log(data)
                if (this.movie != null) {
                  this.uploading = true;

                  this.movieService.uploadMovie(data.Url, this.movie).subscribe({
                    next: (result) => {
                      console.log(result);
                      this.messageService.add({
                        severity: 'success',
                        summary: 'Upload finished',
                        key: 'bc',
                        detail: 'Movie updated successfully!',
                        life: 2000
                      })
                      this.uploading = false;
                      this.router.navigate(['/catalog'])
                    },

                    error: (err) => { console.log(err); this.showError() }
                  });
                }
              },
              error: (err) => { console.log(err); this.showError() }
            })


          }
        });

      } else {
        this.movieService.deleteMovieById(this.movieId, "table").subscribe({
          next: (res) => {
            console.log('deleted')
            console.log(res)
            this.movieService.postMetadata(movie).subscribe({
              next: (res) => {
                console.log("posted metadata")
                console.log(res)
                this.messageService.add({
                  severity: 'success',
                  summary: 'Update finished',
                  key: 'bc',
                  detail: 'Movie updated successfully!',
                  life: 2000
                })
                this.router.navigate(['/catalog'])


              },
              error: (err) => {
                console.log(err);
                this.showError()
              }
            })

          }
        })
      }
    }
  }

  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Upload failed!',
      key: 'bc',
      detail: 'Server error!',
      life: 2000
    })
  }
  toBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
}
