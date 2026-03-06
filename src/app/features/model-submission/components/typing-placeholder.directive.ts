import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appTypingPlaceholder]'
})
export class TypingPlaceholderDirective {
  @Input('appTypingPlaceholder') placeholderText: string = '';
  private originalPlaceholder: string = '';
  private typingInterval: any;

  constructor(private el: ElementRef<HTMLInputElement | HTMLTextAreaElement>) {}

  @HostListener('focus')
  onFocus() {
    this.originalPlaceholder = this.el.nativeElement.placeholder;
    this.animateErasing(this.placeholderText || this.originalPlaceholder);
  }

  @HostListener('blur')
  onBlur() {
    this.el.nativeElement.placeholder = this.originalPlaceholder;
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }

  private animateTyping(text: string) {
    // Old typing animation (not used)
    let i = 0;
    this.el.nativeElement.placeholder = '';
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    this.typingInterval = setInterval(() => {
      this.el.nativeElement.placeholder = text.slice(0, i);
      i++;
      if (i > text.length) {
        clearInterval(this.typingInterval);
      }
    }, 40);

  }

  private animateErasing(text: string) {
    let i = text.length;
    this.el.nativeElement.placeholder = text;
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    this.typingInterval = setInterval(() => {
      this.el.nativeElement.placeholder = text.slice(0, i);
      i--;
      if (i < 0) {
        clearInterval(this.typingInterval);
      }
    }, 40);
  }
}
