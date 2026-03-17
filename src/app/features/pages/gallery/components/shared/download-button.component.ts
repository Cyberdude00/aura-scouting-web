import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'gallery-download-button',
  standalone: true,
  imports: [NgIf],
  template: `
    <button
      [disabled]="disabled"
      class="button-red"
      (click)="onClick($event)"
      [attr.aria-busy]="loading ? 'true' : null"
    >
      <ng-content></ng-content>
      <span *ngIf="loading" class="spinner"></span>
    </button>
  `,
  styles: [`
    .button-red {
      position: relative;
    }
    .spinner {
      margin-left: 8px;
      width: 16px;
      height: 16px;
      border: 2px solid #fff;
      border-top: 2px solid #c00;
      border-radius: 50%;
      display: inline-block;
      animation: spin 1s linear infinite;
      vertical-align: middle;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class GalleryDownloadButtonComponent {
  @Input() disabled = false;
  @Input() loading = false;
  @Input() onClick: (event: Event) => void = () => {};
}
