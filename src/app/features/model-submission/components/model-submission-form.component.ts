import { CommonModule } from '@angular/common';
import { TypingPlaceholderDirective } from './typing-placeholder.directive';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ModelSubmissionPayload,
  ModelSubmissionService,
} from '../services/model-submission.service';

@Component({
  selector: 'app-model-submission-form',
  imports: [CommonModule, FormsModule, TypingPlaceholderDirective],
  templateUrl: './model-submission-form.component.html',
  styleUrl: './model-submission-form.component.scss',
})
export class ModelSubmissionFormComponent {
  imagePreviewSrc = 'images/aura-scouting-logo.png';
  isPreviewing = false;
  isSubmitting = false;
  selectedFile: File | null = null;
  successMessage = '';
  errorMessage = '';

  formData = {
    name: '',
    age: '',
    email: '',
    height: '',
    social_network: '',
    location: '',
    about_me: '',
  };

  constructor(private readonly modelSubmissionService: ModelSubmissionService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Invalid file type. Only JPG, PNG, HEIC, and HEIF are allowed.';
        this.resetImagePreview();
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.errorMessage = 'File must be less than 10MB.';
        this.resetImagePreview();
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';

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
        this.errorMessage = 'Invalid file type. Only image files are allowed.';
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
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.selectedFile) {
      this.errorMessage = 'Please attach a photo.';
      return;
    }

    if (form.valid) {
      this.isSubmitting = true;

      const payload: ModelSubmissionPayload = {
        name: this.formData.name,
        age: Number(this.formData.age),
        email: this.formData.email,
        height: Number(this.formData.height),
        social_network: this.formData.social_network,
        about_me: this.formData.about_me,
        location: this.formData.location,
        photo: this.selectedFile,
      };

      this.modelSubmissionService.submitModel(payload).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Application submitted successfully!';
          this.isSubmitting = false;
          this.formData = {
            name: '',
            age: '',
            email: '',
            height: '',
            social_network: '',
            location: '',
            about_me: '',
          };
          form.resetForm(this.formData);
          this.resetImagePreview();
        },
        error: (error: { error?: { errors?: Array<{ msg: string }>; message?: string } }) => {
          this.isSubmitting = false;
          if (error.error?.errors?.length) {
            this.errorMessage = error.error.errors.map((item) => item.msg).join(', ');
            return;
          }
          this.errorMessage = error.error?.message || 'Submission failed.';
        },
      });
      return;
    }

    this.errorMessage = 'Please complete all required fields correctly.';
  }
}
