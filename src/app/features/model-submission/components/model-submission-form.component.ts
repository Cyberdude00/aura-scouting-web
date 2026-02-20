import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-model-submission-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './model-submission-form.component.html',
  styleUrl: './model-submission-form.component.scss',
})
export class ModelSubmissionFormComponent {
  imagePreviewSrc: string = 'images/aura-scouting-logo.png';
  isPreviewing: boolean = false;
  isSubmitting: boolean = false;
  selectedFile: File | null = null;

  formData = {
    name: '',
    email: '',
    height: '',
    cellphone: ''
  };

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            this.imagePreviewSrc = reader.result as string;
            this.isPreviewing = true;
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Invalid file type. Only JPG, PNG, and GIF images are allowed.');
        this.resetImagePreview();
      }
    } else {
      this.resetImagePreview();
    }
  }

  resetImagePreview(): void {
    this.imagePreviewSrc = 'images/aura-scouting-logo.png';
    this.isPreviewing = false;
    this.selectedFile = null;
  }

  onSubmit(form: any): void {
    console.log('Submit fired', form);

    if (!this.selectedFile) {
      alert('Please attach an image.');
      return;
    }

    if (form.valid) {
      this.isSubmitting = true;

      const formDataToSend = new FormData();
      formDataToSend.append('name', this.formData.name);
      formDataToSend.append('email', this.formData.email);
      formDataToSend.append('height', this.formData.height);
      formDataToSend.append('cellphone', this.formData.cellphone);
      formDataToSend.append('image', this.selectedFile);
    }
  }
}
