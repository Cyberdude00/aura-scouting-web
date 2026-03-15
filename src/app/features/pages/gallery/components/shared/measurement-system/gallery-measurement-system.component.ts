import { Component, Input, OnDestroy } from '@angular/core';
import { GalleryModel } from '../../../data';
import { downloadFullMaterialZip, ModelMaterialSections } from '../../../utils';

type UnitSystem = 'metric' | 'imperial';

@Component({
  selector: 'app-gallery-measurement-system',
  standalone: true,
  templateUrl: './gallery-measurement-system.component.html',
  styleUrl: './gallery-measurement-system.component.scss',
})
export class Measurements implements OnDestroy {
  @Input() model: GalleryModel | null = null;

  unitSystem: UnitSystem = 'metric';
  isSwitching = false;
  isDownloadingFullbook = false;

  private switchTimer: ReturnType<typeof setTimeout> | null = null;
  private switchFrame: number | null = null;

  useMetric(): void {
    this.setUnitSystem('metric');
  }

  useImperial(): void {
    this.setUnitSystem('imperial');
  }

  get canDownloadFullbook(): boolean {
    return !this.isDownloadingFullbook;
  }

  get hasFullbookMedia(): boolean {
    return Boolean(this.model?.fullMaterial);
  }

  get showFullbookButton(): boolean {
    return Boolean(this.model?.fullMaterial);
  }

  async downloadModelFullbook(): Promise<void> {
    if (!this.model || this.isDownloadingFullbook) {
      return;
    }

    const material: ModelMaterialSections = {
      book: this.model.book ?? [],
      extraMaterial: this.model.extraMaterial ?? [],
      polas: this.model.polas ?? [],
      extraSnaps: this.model.extraSnaps ?? [],
      videos: this.model.videos ?? [],
    };

    const totalMedia = Object.values(material).reduce((acc, arr) => acc + arr.length, 0);
    if (totalMedia === 0) {
      return;
    }

    this.isDownloadingFullbook = true;
    try {
      await downloadFullMaterialZip(this.model.name, material);
    } finally {
      this.isDownloadingFullbook = false;
    }
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

  private getFullbookMedia(): string[] {
    if (!this.model) {
      return [];
    }

    return (this.model.fullMaterialMedia ?? []).filter(
      (media): media is string => typeof media === 'string' && media.trim().length > 0,
    );
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
