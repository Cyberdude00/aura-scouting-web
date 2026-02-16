import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ModelSubmissionPayload {
  name: string;
  email: string;
  height: number;
  cellphone: string;
  photo: File;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private http = inject(HttpClient);

  private readonly apiUrl = 'https://api-to-be-developed.com/api/model-submission';

  submitModel(data: ModelSubmissionPayload): Observable<any> {

    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('height', data.height.toString());
    formData.append('cellphone', data.cellphone);
    formData.append('photo', data.photo);

    return this.http.post(this.apiUrl, formData);
  }
}
