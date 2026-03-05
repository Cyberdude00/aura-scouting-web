import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ModelSubmissionPayload {
  name: string;
  age: number;
  email: string;
  height: number;
  social_network: string;
  about_me: string;
  cellphone: string;
  photo: File;
}

@Injectable({
  providedIn: 'root'
})
export class ModelSubmissionService {

  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/api/model-submission';

  submitModel(data: ModelSubmissionPayload): Observable<{ message: string }> {

    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('age', data.age.toString());
    formData.append('email', data.email);
    formData.append('height', data.height.toString());
    formData.append('social_network', data.social_network);
    formData.append('about_me', data.about_me);
    formData.append('cellphone', data.cellphone);
    formData.append('photo', data.photo);

    return this.http.post<{ message: string }>(this.apiUrl, formData);
  }
}
