import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { GalleryModel } from '../../../data/scouting-model.types';

type UnitSystem = 'metric' | 'imperial';

@Component({
  selector: 'app-gallery-measurement-system',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-measurement-system.component.html',
  styleUrl: './gallery-measurement-system.component.scss',
})
export class GalleryMeasurementSystemComponent implements OnDestroy {
  @Input() model: GalleryModel | null = null;

  unitSystem: UnitSystem = 'metric';
  isSwitching = false;

  private switchTimer: ReturnType<typeof setTimeout> | null = null;
  private switchFrame: number | null = null;

  useMetric(): void {
    this.setUnitSystem('metric');
  }

  useImperial(): void {
    this.setUnitSystem('imperial');
  }

  get formattedHeight(): string | null {
    if (!this.model?.height) {
      return null;
    }

    if (this.unitSystem === 'metric') {
      return this.model.height;
    }

    return this.convertHeightToImperial(this.model.height);
  }

  get formattedMeasurements(): string | null {
    if (!this.model?.measurements) {
      return null;
    }

    if (this.unitSystem === 'metric') {
      return this.model.measurements;
    }

    return this.convertMeasurementsToImperial(this.model.measurements);
  }

  private convertHeightToImperial(value: string): string {
    let text = value;

    text = text.replace(/(\d+(?:[.,]\d+)?)\s*m\b/gi, (_, rawMeters: string) => {
      const meters = this.parseNumber(rawMeters);
      if (meters === null) {
        return `${rawMeters}m`;
      }

      const totalInches = (meters * 100) / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}\"`;
    });

    text = text.replace(/(\d+(?:[.,]\d+)?)\s*cm\b/gi, (_, rawCm: string) => {
      const centimeters = this.parseNumber(rawCm);
      if (centimeters === null) {
        return `${rawCm}cm`;
      }

      const totalInches = centimeters / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}\"`;
    });

    return text;
  }

  private convertMeasurementsToImperial(value: string): string {
    let text = value;

    text = text.replace(
      /(\d+(?:[.,]\d+)?)(\s*-\s*)(\d+(?:[.,]\d+)?)\s*cm\b/gi,
      (_, rawStart: string, separator: string, rawEnd: string) => {
        const start = this.parseNumber(rawStart);
        const end = this.parseNumber(rawEnd);

        if (start === null || end === null) {
          return `${rawStart}${separator}${rawEnd}cm`;
        }

        return `${(start / 2.54).toFixed(1)}${separator}${(end / 2.54).toFixed(1)}\"`;
      },
    );

    text = text.replace(/(\d+(?:[.,]\d+)?)\s*cm\b/gi, (_, rawCm: string) => {
      const centimeters = this.parseNumber(rawCm);
      if (centimeters === null) {
        return `${rawCm}cm`;
      }

      return `${(centimeters / 2.54).toFixed(1)}\"`;
    });

    return text;
  }

  private parseNumber(value: string): number | null {
    const parsed = Number.parseFloat(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  private setUnitSystem(system: UnitSystem): void {
    if (this.unitSystem === system) {
      return;
    }

    this.unitSystem = system;
    this.triggerSwitchAnimation();
  }

  private triggerSwitchAnimation(): void {
    if (this.switchTimer !== null) {
      clearTimeout(this.switchTimer);
      this.switchTimer = null;
    }

    if (this.switchFrame !== null) {
      cancelAnimationFrame(this.switchFrame);
      this.switchFrame = null;
    }

    this.isSwitching = false;
    this.switchFrame = requestAnimationFrame(() => {
      this.isSwitching = true;
      this.switchFrame = null;
      this.switchTimer = setTimeout(() => {
        this.isSwitching = false;
        this.switchTimer = null;
      }, 220);
    });
  }

  ngOnDestroy(): void {
    if (this.switchFrame !== null) {
      cancelAnimationFrame(this.switchFrame);
      this.switchFrame = null;
    }

    if (this.switchTimer !== null) {
      clearTimeout(this.switchTimer);
      this.switchTimer = null;
    }
  }
}
